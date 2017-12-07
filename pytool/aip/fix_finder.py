import sys
import re
import copy
import json
import math
from functools import reduce
from bs4 import BeautifulSoup

sys.path.append('../common/')
from canpos import Canpos

FIX_FILE = "./data/JP-ENR-4.3-en-JP.html"
COORDINATE_REG = r"([0-9\.]+)/?N([0-9\.]+)E"
COORDINATE_DETAIL_REG = r"([0-9]+)([0-9]{2})([0-9]{2})\.([0-9]+)"
FIX_CODE_SUBS = [
    [r"MINAMI\sDAITO",  "MINAMIDAITO"],
    [r"NORTH\sCHIDORI", "NORTHCHIDORI"]
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

    def wgs_exp(self):
        return self.north_s + "N/" + self.east_s + "E"

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
        deg, mins, secs, dot_secs = [float(m.group(i)) for i in [1,2,3,4]]
        assert m, s
        #_print("{} {} {} {} {}".format(m.group(0), deg, mins, secs, dot_secs))
        return deg + mins / 60 + (secs + dot_secs * 0.01) / 3600


class Fix:
    FIX     = 'FIX'
    VORDME  = 'VORDME'
    VORTAC  = 'VORTAC'
    VOR     = 'VOR' # nop
    DME     = 'DME' # nop
    CATEGORIES = [FIX, VORDME, VORTAC, VOR, DME]

    def __init__(self, code, category, pron=None):
        self.code = code.strip()
        self.category  = category
        self.pron = pron and pron.strip() or ""
        self.coordinate = None
        assert self.CATEGORIES.index(category) >= 0, self
        if category == Fix.FIX: assert len(code) == 5, self
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


class FixParser:

    def __init__(self):
        self.fixes = []
        self.unknown_codes = []

    def parse(self):
        html_raw = open(FIX_FILE, 'r').read()
        soup = BeautifulSoup(html_raw, 'html.parser')

        tbody = soup.find('div', {'id': 'ENR-4.3'}).find(
            'table', {'class': 'ENR-table'}).find('tbody')
        assert tbody, 'not main table-tbody exist'

        trs = tbody.find_all('tr')
        for tr in trs:
            self.parse_tr(tr)

        for f in self.fixes: _print(f)
        for c in self.unknown_codes: _print(c)

        return

    def parse_tr(self, tr):
        tds = tr.find_all('td')
        assert len(tds) >= 2, "Unknown tds style." + str(tds)

        code =  str(tds[0].get_text())
        coordinate_str = str(tds[1].get_text()).strip()
        
        code = self.__filter_code(code)
        if not code.strip():
            _print("none-line:" + str(tds))
            return None
        
        assert re.match(r"^[A-Z]+$", code), code
        if len(code) != 5:
            self.unknown_codes.append( code )
            # TODO: fetch navaids instead insert fix,
            return None

        coordinate = self.parse_coordinate(coordinate_str)

        fix = Fix(code, Fix.FIX).set_coordinate(coordinate)
        self.fixes.append( fix )

        return fix

    def __filter_code(self, code):
        for r in FIX_CODE_SUBS:
            code = re.sub(r[0], r[1], code.strip())
        return code
    
    def parse_coordinate(self, str):
        m = re.match(COORDINATE_REG, str)
        assert m, str
        coordinate = Coordinate(  m.group(0), m.group(1) )
        return coordinate

def main():
    fix_parser = FixParser()
    fix_parser.parse()


def _print(str):
    IS_DEBUG and print(str) or None

if __name__ == '__main__':
    IS_DEBUG = "--debug" in sys.argv
    main()
