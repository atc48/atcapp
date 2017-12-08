"""
Usage:
  import sys
  sys.path.append('./')
  from fix_finder import FixFinder

  fix_finder = FixFinder().init_by_aip()
  fix = fix_finder.find_by_code("MQE")
  print(fix)

"""
import sys
import re
import copy
import csv
from bs4 import BeautifulSoup

sys.path.append('../common/')
from canpos import Canpos, Coordinate

FIX_FILE = "./data/JP-ENR-4.3-en-JP.html"
FIX_CODE_SUBS = [
    [r"MINAMI\sDAITO",  "MINAMIDAITO"],
    [r"NORTH\sCHIDORI", "NORTHCHIDORI"]
]

RADIO_AID_FILE = "./data/JP-ENR-4.1-en-JP.html"
RADIO_AID_SUBS = [
    [r"ZAO\sYAMADA", "ZAOYAMADA"]
]


class Fix:
    FIX     = 'FIX'
    VORDME  = 'VORDME'
    VORTAC  = 'VORTAC'
    NDB     = 'NDB'
    CATEGORIES = [FIX, VORDME, VORTAC, NDB]

    def __init__(self, code, category, pron=None):
        self.code = code.strip()
        self.category  = category
        self.pron = pron and pron.strip() or ""
        self.coordinate = None
        assert self.CATEGORIES.index(category) >= 0, self
        if category == Fix.FIX: assert len(code) == 5, self
        elif category == Fix.NDB: assert len(code) == 2, self
        else: assert len(code) == 3, self
        if pron: assert category != Fix.FIX, self

    def __str__(self):
        res = "<{}> ({})".format(self.code, self.category)
        if self.pron:
            res = res + "(pron:" + self.pron + ")"
        if self.coordinate:
            res = res + " => " + str(self.coordinate)
        return res

    def __eq__(self, other):
        if other is None or not isinstance(other, Fix):
            return False
        return self.code == other.code and self.category == other.category and \
            self.pron == other.pron and \
            self.coordinate == other.coordinate

    def __ne__(self, other):
        return not self.__eq__(other)

    def set_coordinate(self, coordinate):
        assert isinstance(coordinate, Coordinate) and not self.coordinate
        self.coordinate = coordinate
        return self

    def to_r(self):
        return [self.code, self.category,
                self.coordinate.wgs_exp(),
                self.coordinate.north, self.coordinate.east,
                self.pron]


class AbstractAipTableParser:

    def __init__(self, filepath, div_id):
        self._fixes = []     # accessible from child class
        self._unknowns = []  # accessible from child class
        self.__filepath = filepath
        self.__div_id   = div_id
        
    def parse(self):
        assert not self._fixes, "can not call twice."
        html_raw = open(self.__filepath, 'r').read()
        soup = BeautifulSoup(html_raw, 'html.parser')

        tbody = soup.find('div', {'id': self.__div_id}).find(
            'table', {'class': 'ENR-table'}).find('tbody')
        assert tbody, 'not main table-tbody exist'

        trs = tbody.find_all('tr')
        for tr in trs:
            self._parse_tr(tr)

        self._compact_fixes()

        for f in self._fixes: _print(f)
        _print("---")
        for c in self._unknowns: _print(c)
        _print("---")

        self.identify_info = {
            'num_fixes': len(self._fixes),
            'num_unknown': len(self._unknowns)
        }

        if IS_DEBUG:
            for fix in self._fixes:
                assert 1 == len([f for f in  self._fixes if fix == f])

        self._after_parse()

        return self

    def _parse_tr(self, tr):
        assert False, "not implemented _parse_tr on child class."
    
    def _compact_fixes(self):
        None

    def _after_parse(self):
        None

    def fixes(self):
        return self._fixes.copy()

class RadioAidParser(AbstractAipTableParser):
    FILE = RADIO_AID_FILE
    POSTFIX_CATE_MAP = [
        [r"VOR/DME$"  , Fix.VORDME],
        [r"(VOR|DME)$", Fix.VORDME],
        [r"TACAN$"    , Fix.VORTAC],
        [r"NDB$"      , Fix.NDB]
    ]
    REMOVE_EXP = r"\((decl|var)\.\:[^)]+\)"

    def __init__(self):
        super().__init__(
            self.FILE,
            'ENR-4.1'
        )
        self.__dup_removed = []

    def _after_parse(self):
        for dup in self.__dup_removed:
            selected = [f for f in self._fixes if f.code == dup.code][0]
            _print(str(selected) + " <= " + str(dup) )

        if IS_DEBUG:
            assert not [fix for fix in self._fixes if fix.category == Fix.FIX]
            assert not [fix for fix in self._fixes if not fix.pron]

        self.identify_info['num_dup'] = len(self.__dup_removed)

    def _parse_tr(self, tr):
        tds = tr.find_all('td')
        assert len(tds) >= 2, "Unknown tds style." + str(tds)

        name_s, code, cdn_s =  [str(tds[i].get_text()).strip()
                              for i in [0, 1, 4]]

        name, category = self.__parse_name_text(name_s)
        if not name or not category:
            self._unknowns.append( name_s )
            return

        assert re.match(r"^[A-Z]+$", name), name
        assert re.match(r"^[A-Z]{2,3}$", code), code

        fix = Fix(code, category, name)
        self._fixes.append( fix )

        return fix

    def __parse_name_text(self, text):
        text = re.sub(self.REMOVE_EXP, "", text).strip()
        cate_map = [ m for m in self.POSTFIX_CATE_MAP if re.search(m[0], text) ]
        if not cate_map:
            return [None, None]
        cate_map = cate_map[0]

        name = re.sub(cate_map[0], "", text).strip()
        cate = cate_map[1]

        for r in RADIO_AID_SUBS:
            name = re.sub(r[0], r[1], name)

        return [name, cate]

    def _compact_fixes(self):
        i = 0
        before_len = len(self._fixes)
        while len(self._fixes) > i:
            fix = self._fixes[i]
            i += 1
            if len(self._fixes) <= i:
                continue
            nextfix = self._fixes[i]
            if fix.code == nextfix.code:
                assert fix.pron == fix.pron, "code same but pron not same"
                if fix.category == Fix.VORDME and nextfix.category == Fix.VORDME:
                    self.__dup_removed.append( self._fixes.pop(i) )
                elif fix.category == Fix.VORDME and nextfix.category == Fix.VORTAC:
                    self.__dup_removed.append( self._fixes.pop(i-1) )
                else:
                    _print("---")
                    _print(fix)
                    _print(nextfix)
                    assert False
                assert len(self._fixes) > i+1 or self._fixes[i+1].code != fix.code

        assert before_len == len(self.__dup_removed) + len(self._fixes)


class FixParser(AbstractAipTableParser):

    FILE = FIX_FILE

    def __init__(self, rdo_fix_finder):
        super().__init__(
            self.FILE,
            'ENR-4.3'
        )
        self.rdo_fix_finder = rdo_fix_finder
        self.__rdo_fixes = []

    def _after_parse(self):
        self.identify_info['num_rdo_fix'] = len(self.__rdo_fixes)
        
    def _parse_tr(self, tr):
        tds = tr.find_all('td')
        assert len(tds) >= 2, "Unknown tds style." + str(tds)

        code, cdn_s = [ str(tds[i].get_text()).strip()
                                 for i in [0,1] ]

        code = self.__filter_code(code)
        if not code.strip():
            self._unknowns.append( tds )
            _print("none-line:" + str(tds))
            return None
        assert re.match(r"^[A-Z]+$", code), code

        fix = Fix(code, Fix.FIX) if \
              len(code) == 5 else None
        if not fix:
            fix = self.rdo_fix_finder.find_by_pron( code )
            self.__rdo_fixes.append( fix )

        if not fix:
            self._unknowns.append( code )
            # TODO: fetch navaids instead insert fix,
            return None

        coordinate = Coordinate.parse_coordinate(cdn_s)
        fix.set_coordinate(coordinate)
        
        self._fixes.append( fix )

        return fix

    def __filter_code(self, code):
        for r in FIX_CODE_SUBS:
            code = re.sub(r[0], r[1], code.strip())
        return code


class FixFinder:

    def __init__(self, fixes=None):
        self.__fixes = fixes
        fixes and self.__init_map()

    def init_by_aip(self):
        assert self.__fixes is None
        self.__fixes = self.__parse_fixes()
        self.__init_map()
        return self

    def find_by_code(self, code):
        assert isinstance(code, str) and self.__fixes
        return code in self.__code_map and self.__code_map[code]

    def find_by_pron(self, pron):
        assert isinstance(pron, str) and self.__fixes
        return pron in self.__pron_map and self.__pron_map[pron]

    def all_fixes(self):
        assert self.__fixes
        return self.__fixes

    def category_fix_all(self):
        return [fix for fix in self.all_fixes() if fix.category == Fix.FIX]

    def category_rdo_all(self):
        return [fix for fix in self.all_fixes() if not fix.category == Fix.FIX]

    def __init_map(self):
        self.__code_map = {}
        self.__pron_map = {}
        for fix in self.__fixes:
            self.__code_map[ fix.code ] = fix
            if fix.pron:
                self.__pron_map[ fix.pron ] = fix

    @classmethod
    def __parse_fixes(cls):
        return FixParser(
            FixFinder(
                RadioAidParser().parse().fixes()
            )
        ).parse().fixes()


def print_csv(fixes):
    writer = csv.writer(sys.stdout)
    for fix in fixes:
        writer.writerow(fix.to_r())
    return True

def main():
    rdo_parser = RadioAidParser()
    rdo_parser.parse()
    assert rdo_parser.identify_info == \
        {'num_fixes': 129, 'num_unknown': 0, 'num_dup': 21}

    rdo_fix_finder = FixFinder(rdo_parser.fixes())

    _print("==============================")

    fix_parser = FixParser(rdo_fix_finder)
    fix_parser.parse()
    _print(fix_parser.identify_info)
    assert fix_parser.identify_info == \
        {'num_fixes': 2022, 'num_unknown': 7, 'num_rdo_fix': 56}

    fix_finder = FixFinder().init_by_aip()
    
def _print(str):
    IS_DEBUG and print(str) or None

IS_DEBUG = False

if __name__ == '__main__':
    if "--csv-all" in sys.argv:
        print_csv( FixFinder().init_by_aip().all_fixes() ) and exit()
    if "--csv-only-fix" in sys.argv:
        print_csv( FixFinder().init_by_aip().category_fix_all() ) and exit()
    if "--csv-only-rdo" in sys.argv:
        print_csv( FixFinder().init_by_aip().category_rdo_all() ) and exit()

    IS_DEBUG = "--debug" in sys.argv
    main()
