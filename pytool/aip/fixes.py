import sys
import re
import copy
import json
import math
from functools import reduce
from bs4 import BeautifulSoup

sys.path.append('../common/')
from canpos import Canpos


FILE_ATS_ROUTES = "./data/JP-ENR-3.1-en-JP.html"

ROUTE_REG = r"(^|[^ABGRVW]+)[ABGRVW][0-9]+"
FIX_SPECIAL_SIGN = "▲"
FIX_NORMAL_SIGN  = "△"
FIX_SPECIAL_SIGN_ALT = "＜＋＞"
FIX_NORMAL_SIGN_ALT  = "＜ー＞"
FIX_SPECIAL_REG = FIX_SPECIAL_SIGN_ALT + r"[\s]*([\*A-Za-z\(\)\/\s]+)"
FIX_NORMAL_REG  = FIX_NORMAL_SIGN_ALT + r"[\s]*([\*A-Za-z\(\)\/\s]+)"
COORDINATE_REG = r"([0-9\.]+)/?N/?([0-9\.]+)E" # Some text have an error in AIP
COORDINATE_DETAIL_REG = r"([0-9]+)([0-9]{2})([0-9]{2})\.([0-9]+)"

REPLACE_STRINGS = [
    ["(TFE R216/25DME)", ""],
    [" VOR(",  " VOR/DME("] # replace all VOR to VOR/DME (aip may have some miss)
]


class Coordinate:
    def __init__(self, north, east):
        assert isinstance(north, str) and isinstance(east, str), "must_str"
        self.north_s = north
        self.east_s  = east
        # 322747.26N/1361310.48E
        self.north = self.wgs84_str_to_float(north)
        self.east  = self.wgs84_str_to_float(east)
        self.canpos = Canpos(self.east, self.north)

    def __str__(self):
        return "<{}N{}E> ({}, {})".format(
            self.north_s, self.east_s, self.canpos.north, self.canpos.east)

    def __eq__(self, other):
        if other is None or not isinstance(other, Coordinate):
            return False
        return self.north_s == other.north_s and \
            self.east_s == other.east_s
    
    @staticmethod
    def wgs84_str_to_float(s):
        m = re.match(COORDINATE_DETAIL_REG, s)
        assert m, s
        deg, mins, secs, dot_secs = [float(m.group(i)) for i in [1,2,3,4]]
        #_print("{} {} {} {} {}".format(m.group(0), deg, mins, secs, dot_secs))
        return deg + mins / 60 + (secs + dot_secs * 0.01) / 3600
    

class Route:
    def __init__(self, code):
        assert re.match(r"^[ABGRVW][0-9]+$", code)
        self.code = code
        self.__relation = RouteRelation(self) # optional var so not used in __eq__

    def __str__(self):
        return "[{}]".format(self.code)

    def __eq__(self, other):
        if other is None or not isinstance(other, Route):
            return False
        return self.code == other.code

    def __ne__(self, other):
        return not self.__eq__(other)
    
    def relation(self):
        return self.__relation
   
class Fix:
    FIX     = 'FIX'
    VORDME  = 'VORDME'
    VORTAC  = 'VORTAC'
    VOR     = 'VOR'
    DME     = 'DME'
    CATEGORIES = [FIX, VORDME, VORTAC, VOR, DME]
    NAVAIDS_INFO_REG = r"([A-Z]+)" + r"\s+" + \
                       "({}|{}|{}|{})".format(VORDME, VORTAC, VOR, DME) + r"\s*" + \
                       r"\(([A-Z]+)\)"

    def __init__(self, code, category, is_compulsory, pron=None, is_fir_boundary=False):
        self.code = code.strip()
        self.category  = category
        self.is_compulsory = bool(is_compulsory) # is a Compulsory Reporting Point
        self.pron = pron and pron.strip() or ""
        self.is_fir_boundary = bool(is_fir_boundary)
        self.coordinate = None
        assert self.CATEGORIES.index(category) >= 0, self
        if category == Fix.FIX: assert len(code) == 5, self
        if pron: assert category != Fix.FIX, self

        self.__relation = FixRelation(self) # optional var so not used in __eq__

    def __str__(self):
        res = "<{}> ({}:{})".format(self.code, self.category, self.crp_str())
        if self.pron:
            res = res + "(pron:" + self.pron + ")"
        if self.is_fir_boundary:
            res = res + "(FIR-BDY)"
        if self.coordinate:
            res = res + " => " + str(self.coordinate)
        return res

    def __eq__(self, other):
        if other is None or not isinstance(other, Fix):
            return False
        return self.code == other.code and self.category == other.category and \
            self.is_compulsory == other.is_compulsory and \
            self.pron == other.pron and self.is_fir_boundary == other.is_fir_boundary and \
            self.coordinate == other.coordinate

    def __ne__(self, other):
        return not self.__eq__(other)
    
    def crp_str(self): # (N)CRP: (Non) Complusory Reporting Point
        return "CRP" if self.is_compulsory else "NCRP"

    def set_coordinate(self, coordinate):
        assert isinstance(coordinate, Coordinate) and not self.coordinate
        self.coordinate = coordinate

    def relation(self):
        return self.__relation


class RouteRelation:

    def __init__(self, route):
        assert isinstance(route, Route)
        self.route = route
        self.fixes = []

    def append_fix(self, fix):
        assert isinstance(fix, Fix)
        assert not fix in self.fixes
        self.fixes.append(fix) # ! must keep the order of the fixes

    def num_fixes(self):
        return len(self.fixes)


class FixRelation:

    def __init__(self, fix):
        assert isinstance(fix, Fix)
        self.fix = fix
        self.routes = []
        
    def append_belonging_to(self, rte):
        assert isinstance(rte, Route)
        assert not rte in self.routes
        self.routes.append( rte )

    def num_routes(self):
        return len(self.routes)


class OneLineParser:
    REPLACE_MAP = REPLACE_STRINGS
    
    def __init__(self, text):
        self.text = re.sub(r'\s+', ' ', text.strip())
        self.__last_idx = -1
        self.parsed_objects = []
        for repmap in self.REPLACE_MAP:
            self.text = self.text.replace(repmap[0], repmap[1])

    def parse_all(self):
        parsed = [
            self.fetch_route(),
            self.fetch_fix(),
            self.fetch_coorinate()
        ]
        parsed = [x for x in parsed if x is not None]
        if len(parsed) == 0:
            return
        parsed.sort(key=lambda res:res[1].span()[0])
        for p in parsed:
            self.__append_parsed(p[0], p[1])

    def fetch_route(self):
        matched = re.search(ROUTE_REG, self.text)
        if not matched:
            return None
        route = Route(matched.group(0))
        return route, matched

    def fetch_fix(self):
        matched = re.search(FIX_SPECIAL_REG, self.text) or \
                  re.search(FIX_NORMAL_REG, self.text)
        if not matched:
            return None
        
        raw = matched.group(1)
        is_special = bool(re.search(FIX_SPECIAL_REG, matched.group()))

        fix = self.__make_fix(raw.strip(), is_special)
        assert fix

        return fix, matched

    def __make_fix(self, info, is_compulsory):
        if  info[0] == '*': info = info[1:]
        if info[-1] == '*': info = info[:-1]
            
        if len(info) == 5 and not re.search(r'\(\)\\', info):
            return Fix(info, Fix.FIX, is_compulsory)

        matched = re.match(r"^([A-Z]+)\s*\(FIR Boundary\)$", info)
        if matched and len(matched.group(1)) == 5:
            return Fix(matched.group(1), Fix.FIX, is_compulsory, None, True)

        info = info.replace("VOR/DME", Fix.VORDME)
        matched = re.search(Fix.NAVAIDS_INFO_REG, info)

        if matched:
            return Fix(matched.group(3), matched.group(2), is_compulsory, matched.group(1))

        assert False, "Unknown Fix type: " + self.text

    def fetch_coorinate(self):
        matched = re.search(COORDINATE_REG, self.text)
        if not matched:
            return None
        north = matched.group(1)
        east  = matched.group(2)
        coord = Coordinate(north, east)
        return coord, matched

    def has_any_fetched(self):
        return self.__last_idx > -1

    def __append_parsed(self, obj, matched):
        self.__assert_char_idx(matched)
        self.parsed_objects.append(obj)
        
    def __assert_char_idx(self, matched):
        assert matched.span()[0] > self.__last_idx, self.text
        self.__last_idx = matched.span()[1]


class FixRouteStructurizer:

    def __init__(self, parsed_objects):
        for obj in parsed_objects:
            assert bool([1 for klass in [Fix, Route, Coordinate]
                         if isinstance(obj, klass)]), "Unknown obj. " + str(obj)
        self.objs_origin = parsed_objects
        self.__objs      = parsed_objects.copy()
        self.result_info = { 'num_all_objs' : len(self.objs_origin) }

        self.__fold_coordinates_to_fix()
        self.__fold_dup_fixes_to_one()
        self.__fold_continuous_route_to_one()
        self.__make_relations()

        #for o in self.__objs: _print(o)

    def __fold_coordinates_to_fix(self):
        i = 0
        while i < len(self.__objs):
            fix = self.__objs[i]
            i += 1
            if not isinstance(fix, Fix): continue
            coord = self.__objs.pop(i)
            assert isinstance(coord, Coordinate), \
                "must Coordinate after Fix.\n" + str(fix) + "\n" + str(coord)
            fix.set_coordinate( coord )
        origin_coord_count = len([o for o in self.objs_origin
                                  if isinstance(o, Coordinate)])
        assert len(self.__objs) == len(self.objs_origin) - origin_coord_count
        assert not [o for o in self.__objs if isinstance(o, Coordinate)]
        self.result_info["num_coordinates"] = origin_coord_count

    def __fold_dup_fixes_to_one(self):
        before_objs_size = len(self.__objs)
        i = 0
        self.__dup_removed_fixes = []
        while i < len(self.__objs):
            fix = self.__objs[i]
            i += 1
            if not isinstance(fix, Fix): continue
            dup_indices = [
                arr_idx + i # because enumerating __obj[i:] in this enum loop
                for arr_idx, other_fix
                in enumerate(self.__objs[i:])
                if other_fix == fix and (other_fix is not fix)
            ]
            for dup_idx in dup_indices:
                self.__dup_removed_fixes.append( self.__objs[dup_idx] )
                self.__objs[dup_idx] = fix

        for fix in self.__objs:
            dups = [dup for dup in self.__objs
                    if isinstance(dup, Fix) and (dup is not fix) and
                    dup.code == fix.code]
            assert len(dups) == 0, "Same name fix still exists.\n" + \
                str(fix) + ", \n" + str([str(d) for d in dups])

        assert before_objs_size == len(self.__objs)
        self.result_info["num_removed_dup_fixes"] = len(self.__dup_removed_fixes)

    def __fold_continuous_route_to_one(self):
        before_objs_size = len(self.__objs)
        last_route = None
        i = 0
        self.__dup_removed_routes = []
        while i < len(self.__objs):
            route = self.__objs[i]

            if route == last_route:
                self.__objs.pop(i)
                self.__dup_removed_routes.append( route )
            else:
                i += 1

            last_route = route
            while i < len(self.__objs) and not isinstance(self.__objs[i], Route):
                i += 1

        assert before_objs_size == len(self.__objs)+len(self.__dup_removed_routes)
        self.result_info["num_removed_dup_routes"] = len(self.__dup_removed_routes)
        
    def __make_relations(self):
        origin_objs_size = len(self.__objs)
        self.routes = []
        self.fixes  = []
        while len(self.__objs) > 0:
            route = self.__objs.pop(0)
            assert isinstance(route, Route)
            self.routes.append( route )
            fix = self.__objs.pop(0)
            assert isinstance(fix, Fix)
            while isinstance(fix, Fix):
                self.fixes.append( fix )
                self.__connect_relation(route, fix)
                if len(self.__objs) == 0:
                    fix = None
                    break
                fix = self.__objs.pop(0)
            if fix:
                self.__objs.insert(0, fix)

        assert len(self.__objs) == 0 and \
            origin_objs_size == (len(self.routes) + len(self.fixes))

        self.remove_dups(self.routes)
        self.remove_dups(self.fixes)
        assert origin_objs_size == (len(self.routes) + len(self.fixes) + self.result_info["num_removed_dup_fixes"])

        self.result_info['num_routes'] = len(self.routes)
        self.result_info['num_fixes']  = len(self.fixes)

    def __connect_relation(self, route, fix):
        assert isinstance(route, Route) and isinstance(fix, Fix)
        route.relation().append_fix( fix ) # append order is important
        fix.relation().append_belonging_to( route ) # has no no order.

    @staticmethod
    def remove_dups(arr):
        i = 0
        removed = []
        while i < len(arr):
            one = arr[i]
            i += 1
            if i >= len(arr): break
            dup_indices = [
                idx + i for idx, other in enumerate(arr[i:]) if one == other ]
            dup_indices.reverse()
            for dup_idx in dup_indices:
                removed.append( arr.pop(dup_idx) )
        return removed

    
class HtmlParser:
    @classmethod
    def parse_text(cls, text):
        parser = OneLineParser(text)
        parser.parse_all()
        if not parser.has_any_fetched():
            return None
        return parser.parsed_objects

    @classmethod
    def parse_td(cls, td):
        td_raw = str(td)
        td_raw = re.sub(r'<br[ \/]*>', ' ', td_raw)
        td_raw = re.sub(r'[\t\n\r]', ' ', td_raw)
        td_raw = re.sub(FIX_SPECIAL_SIGN, FIX_SPECIAL_SIGN_ALT, td_raw)
        td_raw = re.sub( FIX_NORMAL_SIGN,  FIX_NORMAL_SIGN_ALT, td_raw)
        td = BeautifulSoup(str(td_raw), 'html.parser')
        text = td.get_text()
        text = re.sub(r'\s+', ' ', text.strip())
        if not text:
            return None
        return cls.parse_text(text)

    @classmethod
    def parse_tbody(cls, tbody):
        parsed_objects = []
        trs = tbody.find_all('tr')
        for tr in trs:
            tds = tr.find_all('td')
            if not tds:
                continue
            else:
                new_parsed = cls.parse_td(tds[0])
                if new_parsed:
                    parsed_objects += new_parsed
        return parsed_objects

    @classmethod
    def parse(cls, html_raw):
        soup = BeautifulSoup(html_raw, 'html.parser')
        main_div = soup.find('div', {'id': 'ENR-3.1'})
        assert main_div, 'not main div exist'
        tables = main_div.find_all('table')
        tbodies = [table.find('tbody') for i, table in enumerate( tables )]

        parsed_objects = []
        for tbody in tbodies:
            parsed = cls.parse_tbody(tbody)
            if parsed:
                parsed_objects += parsed

        return parsed_objects

def _print_route_detail(route):
    _print(route)
    _print("  num_fixes: " + str(route.relation().num_fixes()))
    for fix in route.relation().fixes:
        _print("  " + str(fix) + " belongs to: " + str(
            [str(rte.code) for rte in fix.relation().routes]
        ))
    
def test():
    # MQE: 395156.30N/1415703.84E
    # https://www.motohasi.net/GPS/PosConv.php
    # 39.86563888/141.95106666
    for r in [ ["395156.30",   39.86563888],
               ["1415703.84", 141.95106666] ]:
        checkee = Coordinate.wgs84_str_to_float(r[0])
        answer = r[1]
        assert abs(checkee - answer) <= 0.1 ** 8

    r = [0,1,2,3, 0,1,2,3, 0,1,2,3,4,5]
    origin_size = len(r)
    removed = FixRouteStructurizer.remove_dups(r)
    assert r == [0, 1, 2, 3, 4, 5]
    assert removed == [0, 0, 1, 1, 2, 2, 3, 3]
    assert len(r) + len(removed) == origin_size

def main():
    test()
    html_raw = open(FILE_ATS_ROUTES, 'r').read()
    parsed_objects = HtmlParser.parse(html_raw)
    structer = FixRouteStructurizer(parsed_objects)

    for route in structer.routes:
        _print_route_detail( route )
    
    _print(structer.result_info)
    _print(len(parsed_objects))

    assert structer.result_info == \
        {'num_all_objs': 1120, 'num_coordinates': 521, 'num_removed_dup_fixes': 126, 'num_removed_dup_routes': 6, 'num_routes': 72, 'num_fixes': 395}


def _print(str):
    IS_DEBUG and print(str) or None

if __name__ == '__main__':
    IS_DEBUG = "--debug" in sys.argv
    main()
