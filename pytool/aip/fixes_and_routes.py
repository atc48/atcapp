import sys
import re
import copy
import json
from bs4 import BeautifulSoup

sys.path.append('./../common/')
from util import KeyMapMaker, DictionaryMapMaker

sys.path.append('./')
from fix_finder import Coordinate, Fix, FixFinder


FILE_UPPER_ATS_ROUTES = "./data/JP-ENR-3.1-en-JP.html"
FILE_RNAV_ROUTES      = "./data/JP-ENR-3.3-en-JP.html"
FIX_AND_ROUTE_VAR_NAME = "atcapp.DATA_FIXES_AND_ROUTES"

ROUTE_REG = r"(^|[^ABGRVW]+)[ABGRVW][0-9]+"
FIX_SPECIAL_SIGN = "▲"
FIX_NORMAL_SIGN  = "△"
FIX_SPECIAL_SIGN_ALT = "＜＋＞"
FIX_NORMAL_SIGN_ALT  = "＜ー＞"
FIX_SPECIAL_REG = FIX_SPECIAL_SIGN_ALT + r"[\s]*([\*A-Za-z\(\)\/\s]+)"
FIX_NORMAL_REG  = FIX_NORMAL_SIGN_ALT + r"[\s]*([\*A-Za-z\(\)\/\s]+)"
RDO_AIDS_INFO_REG = r"([A-Z]+)" + r"\s+" + \
                    "({}|{}|{}|{})".format("VORDME", "VORTAC", "VOR", "DME") + \
                    r"\s*\(([A-Z]+)\)"

REPLACE_STRINGS = [
    ["(TFE R216/25DME)", ""],
    [" VOR(",  " VORDME("], # replace all VOR to VOR/DME (aip may have some miss)
    ["VOR/DME", "VORDME"]
]

GRID_NUM_UNIT_SIZE = 3 # default Canpos: 10


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


class RouteRelation:

    def __init__(self, route):
        assert isinstance(route, Route)
        self.route = route
        self.fixes = []

    def append_fix(self, fix):
        assert isinstance(fix, Fix)
        assert not fix in self.fixes
        self.fixes.append(fix) # ! must keep the order of the fixes

    def fix_codes(self):
        return [fix.code for fix in self.fixes]

    def num_fixes(self):
        return len(self.fixes)


class FixRelation:

    PRIORITY_VALS = list(range(-1, 4))

    def __init__(self, fix):
        assert isinstance(fix, Fix)
        self.fix = fix
        self.routes = []
        self.priority = -1 if fix.category == Fix.NDB else 0

    def up_priority_as_on_fir_boundary(self):
        self.__update_priority( 3 )

    def up_priority_as_an_compulsory_reporting_point(self):
        self.__update_priority( 2 )

    def up_priority_as_on_any_route(self):
        self.__update_priority( 1 )

    def __update_priority(self, priority):
        assert priority in self.PRIORITY_VALS, priority
        if self.priority < priority:
            self.priority = priority
        
    def is_fir_boundary(self):
        return self.priority >= 3

    def is_compulsory(self):
        return self.priority >= 2

    def append_belonging_to(self, rte):
        assert isinstance(rte, Route)
        assert not rte in self.routes
        self.routes.append( rte )

    def route_codes(self):
        return [rte.code for rte in self.routes]

    def num_routes(self):
        return len(self.routes)

    def __str__(self):
        return "<Relation:" + self.fix.code + " priority=" + str(self.priority) + \
                    ", routes=" + str(self.routes)


class OneLineParser:
    REPLACE_MAP = REPLACE_STRINGS
    
    def __init__(self, text, fix_finder):
        self.text = re.sub(r'\s+', ' ', text.strip())
        self.__last_idx = -1
        self.parsed_objects = []
        for repmap in self.REPLACE_MAP:
            self.text = self.text.replace(repmap[0], repmap[1])
        self.fix_finder = fix_finder

    def parse_all(self):
        parsed = [
            self.fetch_route(),
            self.fetch_fix()
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
        is_compulsory = bool(re.search(FIX_SPECIAL_REG, matched.group()))

        code, category, is_fir_boundary, pron = \
            self.__get_fix_code_and_attr( raw.strip() )
        fix = self.fix_finder.find_by_code( code )
        assert fix and fix.category == category and (not pron or pron == fix.pron)

        if is_compulsory:
            fix.relation().up_priority_as_an_compulsory_reporting_point()
        if is_fir_boundary:
            fix.relation().up_priority_as_on_fir_boundary()
        
        return fix, matched

    # returns [code, category, is_fir_boundary, pronounciation]
    def __get_fix_code_and_attr(self, text):
        if text[0]  == '*': text = text[1:]
        if text[-1] == '*': text = text[:-1]

        if len(text) == 5 and not re.search(r'\(\)\\', text):
            return [text, Fix.FIX, False, None]

        matched = re.match(r"^([A-Z]+)\s*\(FIR Boundary\)$", text)
        if matched and len(matched.group(1)) == 5:
            return [matched.group(1), Fix.FIX, True, None]

        matched = re.search(RDO_AIDS_INFO_REG, text)
        if matched:
            return [matched.group(3), matched.group(2), False, matched.group(1)]

        assert False, "Unknown Fix:" + self.text

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

        self.__fold_dup_fixes_to_one()
        self.__fold_continuous_route_to_one()
        self.__make_relations()

        #for o in self.__objs: _print(o)

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

        assert not self.remove_dups(self.routes)
        self.result_info["num_removed_dup_fixes"] = \
                                    len(self.remove_dups(self.fixes))
        assert origin_objs_size == (len(self.routes) + len(self.fixes) + self.result_info["num_removed_dup_fixes"])

        self.result_info['num_routes'] = len(self.routes)
        self.result_info['num_fixes']  = len(self.fixes)

    def __connect_relation(self, route, fix):
        assert isinstance(route, Route) and isinstance(fix, Fix)
        route.relation().append_fix( fix ) # append order is important
        fix.relation().append_belonging_to( route ) # has no no order.
        fix.relation().up_priority_as_on_any_route()


    def supply_additional_fixes_if_not_exists(self, fixes_additional):
        assert not "num_supplied_fixes" in self.result_info.keys(), \
            "only once suppliable"            
        num_added = 0
        for add_fix in fixes_additional:
            assert isinstance(add_fix, Fix), add_fix
            exists = [1 for fix in self.fixes if fix.code == add_fix.code]
            if not exists:
                self.fixes.append( add_fix )
                _print( add_fix.relation() )
                num_added += 1
        self.result_info["num_supplied_fixes"] = num_added

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

    def __init__(self, fix_finder):
        self.fix_finder = fix_finder

    def parse_text(self, text):
        parser = OneLineParser(text, self.fix_finder)
        parser.parse_all()
        if not parser.has_any_fetched():
            return None
        return parser.parsed_objects

    def parse_td(self, td):
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
        return self.parse_text(text)

    def parse_tbody(self, tbody):
        parsed_objects = []
        trs = tbody.find_all('tr')
        for tr in trs:
            tds = tr.find_all('td')
            if not tds:
                continue
            else:
                new_parsed = self.parse_td(tds[0])
                if new_parsed:
                    parsed_objects += new_parsed
        return parsed_objects

    def parse(self, html_raw, div_id):
        soup = BeautifulSoup(html_raw, 'html.parser')
        main_div = soup.find('div', {'id': div_id})
        assert main_div, 'not main div exist'
        tables = main_div.find_all('table')
        tbodies = [table.find('tbody') for i, table in enumerate( tables )]

        parsed_objects = []
        for tbody in tbodies:
            parsed = self.parse_tbody(tbody)
            if parsed:
                parsed_objects += parsed

        return parsed_objects


class JsonMaker:
    FIX_CAT_MAP = {
        'FIX'    : 1,
        'VORDME' : 2,
        'VORTAC' : 3,
        'NDB'    : 4
    }
    BOOL_MAP = {
        True : 1,
        False: 0
    }

    def __init__(self, routes, fixes):
        self.routes = routes
        self.fixes  = fixes
        self.result = {}
        self.__generate()

    def __generate(self):
        dict_fixes = {
            fix.code : self.__make_fix_val(fix)
            for fix in self.fixes
        }

        dict_routes = {
            rte.code  : self.__make_route_val(rte)
            for rte in self.routes
        }

        self.result['fixes_keys']  = self.fixes_keys
        self.result['routes_keys'] = self.routes_keys
        self.result['fixes']  = dict_fixes
        self.result['routes'] = dict_routes
        self.result['priority_grid_map'] = self.__make_fix_priority_and_grid_num_map()
        self.result['grid_to_rte'] = [] #TODO
        self.result['grid_map_unit_size'] = GRID_NUM_UNIT_SIZE;
        self.result['fix_codes_dict_map'] = DictionaryMapMaker().make([fix.code for fix in self.fixes])

    def __make_fix_val(self, fix):
        assert isinstance(fix, Fix)
        canpos = fix.coordinate.canpos.to_round(4)
        route_codes = fix.relation().route_codes()
        res = [
            canpos.to_r(),
            self.FIX_CAT_MAP[ fix.category ],
            fix.relation().priority,
            self.BOOL_MAP[ fix.relation().is_compulsory() ],
            fix.pron or 0,
            self.BOOL_MAP[ fix.relation().is_fir_boundary() ],
            fix.coordinate.wgs_exp(),
            route_codes
        ]
        self.fixes_keys = [
            'canpos_array',
            'category_key',
            'priority',
            'is_compulsory',
            'pronounciation',
            'is_fir_boundary',
            'coord_exp',
            'route_codes'
        ]
        return res

    def __make_route_val(self, rte):
        assert isinstance(rte, Route)
        fix_codes = [code for code in rte.relation().fix_codes()]
        res = [
            fix_codes
        ]
        self.routes_keys = [
            'fix_codes'
        ]
        return res

    def __make_fix_priority_and_grid_num_map(self):
        get_priority = lambda fix: fix.relation().priority
        get_grid_num = lambda fix: fix.coordinate.canpos.get_grid_num(GRID_NUM_UNIT_SIZE)
        filter_obj = lambda fix: fix.code
        
        maker = KeyMapMaker(self.fixes, get_priority, get_grid_num, filter_obj)
        fix_map = maker.make()
        
        return fix_map

    def json(self):
        return json.dumps(self.result, indent=2)
        

def _print_route_detail(route):
    _print(route)
    _print("  num_fixes: " + str(route.relation().num_fixes()))
    for fix in route.relation().fixes:
        _print("  " + str(fix) + " belongs to: " + str(
            [str(rte.code) for rte in fix.relation().routes]
        ))
    
def test():
    r = [0,1,2,3, 0,1,2,3, 0,1,2,3,4,5]
    origin_size = len(r)
    removed = FixRouteStructurizer.remove_dups(r)
    assert r == [0, 1, 2, 3, 4, 5]
    assert removed == [0, 0, 1, 1, 2, 2, 3, 3]
    assert len(r) + len(removed) == origin_size

def parse_file(file_path, div_id, fix_finder, assertion_result_info):
    html_raw = open(file_path, 'r').read()
    parsed_objects = HtmlParser(fix_finder).parse(html_raw, div_id)
    structer = FixRouteStructurizer(parsed_objects)

    structer.supply_additional_fixes_if_not_exists(fix_finder.all_fixes())

    for route in structer.routes:
        _print_route_detail( route )
    
    _print(structer.result_info)
    _print(len(parsed_objects))

    if assertion_result_info:
        assert structer.result_info == assertion_result_info, structer.result_info

    return structer
   
def main():
    fix_finder = FixFinder().init_by_aip()
    for fix in fix_finder.all_fixes():
        fix.set_relation( FixRelation(fix) )

    structer = parse_file(FILE_UPPER_ATS_ROUTES, 'ENR-3.1', fix_finder, \
        {'num_all_objs': 599, 'num_removed_dup_fixes': 126, 'num_removed_dup_routes': 6, 'num_routes': 72, 'num_fixes': 395, 'num_supplied_fixes': 1706})

    #structer = parse_file(FILE_RNAV_ROUTES, 'ENR-3.3', None)

    json_maker = JsonMaker(structer.routes, structer.fixes)
    if not IS_DEBUG:
        print(FIX_AND_ROUTE_VAR_NAME + " =\n" + json_maker.json())


def _print(str):
    IS_DEBUG and print(str) or None

if __name__ == '__main__':
    IS_DEBUG = "--debug" in sys.argv
    main()
