import sys
import re
import copy
import json
import math
from functools import reduce
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


class AbstractAipTableParser:

    def __init__(self, filepath, div_id):
        self._fixes = []     # accessible from child class
        self._unknowns = []  # accessible from child class
        self.__filepath = filepath
        self.__div_id   = div_id
        

    def parse(self):
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

    def __init__(self):
        super().__init__(
            self.FILE,
            'ENR-4.3'
        )

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
        if len(code) != 5:
            self._unknowns.append( code )
            # TODO: fetch navaids instead insert fix,
            return None

        coordinate = Coordinate.parse_coordinate(cdn_s)

        fix = Fix(code, Fix.FIX).set_coordinate(coordinate)
        self._fixes.append( fix )

        return fix

    def __filter_code(self, code):
        for r in FIX_CODE_SUBS:
            code = re.sub(r[0], r[1], code.strip())
        return code



#TODO: make navaids finder and set it into fix finder
#TODO: fix finder




def main():
    fix_parser = FixParser()
    fix_parser.parse()
    assert fix_parser.identify_info == {'num_fixes': 1972, 'num_unknown': 57}


    rdo_parser = RadioAidParser()
    rdo_parser.parse()
    assert rdo_parser.identify_info == {'num_fixes': 129, 'num_unknown': 0, 'num_dup': 21}


def _print(str):
    IS_DEBUG and print(str) or None

if __name__ == '__main__':
    IS_DEBUG = "--debug" in sys.argv
    main()
