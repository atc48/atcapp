import sys
from bs4 import BeautifulSoup # pip install beautifulsoup4
import re
from functools import reduce
import copy
import pprint
pprint = pprint.PrettyPrinter(indent=4).pprint
import json

sys.path.append('../common/')
import canpos
Canpos = canpos.Canpos

ENR2_1_PATH = "./data/aip-enr-2.1.html"

SECTORS_VAR_NAME     = "atcapp.DATA_SECTORS"
CANPOS_ROUND_NUM     = 8
VERSION              = 1.0

class Sector:
    RE = re.compile("([A-Z][0-9]+)\s*\(\s*([^\)]*)\s*\)")
    #s: "A05(Oceanic South B)", "S01 (Misawa West Sector)"
    def __init__(self, s):
        m = self.RE.match( re.sub(r'\s', " ", s) )
        self.raw = m.group(0)
        self.sign = m.group(1)
        self.name = m.group(2)
        self.pol_ids = []
        self.remarkss = []
    def append_polygon(self, pool, polygon, remarks):
        assert(isinstance(pool, PolygonPool) and isinstance(polygon, Polygon) and
               isinstance(remarks, list))
        pol_id = pool.push(polygon)
        self.pol_ids.append( pol_id )
        self.remarkss.append(remarks)
        return self
    def signname(self):
        return "{}({})".format(self.sign, self.name)
    def num_polygons(self):
        return len(self.pol_ids)
    def __str__(self):
        return super().__str__() + " " + self.signname
    @classmethod
    def is_sector_name(cls, s):
        return cls.RE.match(s)
    @classmethod
    def nullobj(cls):
        return cls("X00 (Null Sector)")

class Polygon:
    def __init__(self, points):
        self.points = points
    def __eq__(self, other):
        return self.__class__ == other.__class__ and \
            self.points == other.points
    @classmethod
    def test(cls):
        assert(Polygon([1.23, 4.56]) == Polygon([1.23, 4.56]))
        assert(not (None == Polygon([1.23, 4.56])))

class PolygonPool:
    def __init__(self):
        self.__pool = [Polygon([])]
    # Returns id value: 1, 2, 3,.. in order
    def push(self, polygon):
        return self.id_or_none(polygon) or \
            self.__pool.append(polygon) or (len(self.__pool) - 1)
    def id_or_none(self, polygon):
        pols = [p for p in self.__pool if p == polygon]
        assert(len(pols) <= 1)
        return self.__pool.index(polygon) if len(pols) == 1 else None
    def to_arr(self):
        return copy.copy(self.__pool)
        
    @classmethod
    def test(cls):
        pool = PolygonPool()
        assert(1 == pool.push(Polygon([1])) and 2 == pool.push(Polygon([2])))
        assert(1 == pool.push(Polygon([1])) and 3 == pool.push(Polygon([3])))
        assert(2 == pool.push(Polygon([2])))

class Simplifier:
    def __init__(self, sectors, polygon_pool, round_num):
        assert(0==len([s for s in sectors if not isinstance(s, Sector)]))
        assert(isinstance(polygon_pool, PolygonPool))
        self.round_num = round_num
        poldic_list = [self.__polygon_to_dict(pol, i) for i, pol
                       in enumerate(polygon_pool.to_arr())]
        poldic_list = [self.__insert_sec_ids_to_polygon_dict(poldic, i, sectors)
                       for i, poldic
                       in enumerate(poldic_list)]
        secdic_list = [self.__sector_to_dict(sec) for sec in sectors ]
        self.result = {
            'polygons': poldic_list,
            'sectors' : secdic_list
        }
    def __polygon_to_dict(self, polygon, i):
        assert(isinstance(polygon, Polygon))
        canpos_list = polygon.points
        h = {
            'canpos_list': [canpos.to_round( self.round_num ).to_arr() for canpos in canpos_list],
            'pol_id' : i,
            'sec_ids': []
        }
        return h
    def __insert_sec_ids_to_polygon_dict(self, poldic, pol_id, sectors):
        poldic['sec_ids'] = [
            sec.sign for sec in sectors if pol_id in sec.pol_ids
        ]
        return poldic
    def __sector_to_dict(self, sector):
        assert(isinstance(sector, Sector))
        pol_hashes = []
        for i, pol_id in enumerate(sector.pol_ids):
            pol_h = {
                'pol_id' : pol_id, # 33
                'rmk'    : sector.remarkss[i] if len(sector.remarkss[i]) > 0 else None
            }
            pol_hashes.append(pol_h)
        h = {
            'sec_id'   : sector.sign, # "T04"
            'sec_name' : sector.name, # "Kanto East Sector"
            'pols'     : pol_hashes   # [{pol_id: 33, rmk: ["FL200+"]}, ..]
        }
        return h
        
def print_acc_sector_boundaries(table, _print, is_debug):
    class _ItrStatus:
        def __init__(self):
            self.last_sector = Sector.nullobj()
            self.pol_num     = 0
    _cur = _ItrStatus()
    pol_pool = PolygonPool()
    sectors = []
    for i, tr in enumerate( table.find('tbody').find_all('tr') ):
        tds = tr.find_all('td')
        assert(type(tr)), i
        if(len(tds) == 0):
            pass
        # sector name
        elif(Sector.is_sector_name(tds[0].get_text())):
            _cur.last_sector = Sector(tds[0].get_text())
            sectors.append(_cur.last_sector)
            _cur.pol_num = 0
            _print(_cur.last_sector.signname() + " -----------------")
        # coordinations
        elif(len(tds[1].find_all("em")) >= 1):
            html_raw = str(tds[1])
            html = re.sub(re.compile("\s*of\s*[0-9]+N[0-9]+E"), '', html_raw)
            canpos_list = Canpos.canpos_list_by_aip_coord(html)
            _print("--------")
            for c in canpos_list:
                _print(" " + str(c.to_r()))
            _print(len(canpos_list))
            html_spec = re.sub("of <em>", "of ", html_raw)
            remarks = re.findall(re.compile("[^><\*]*(\*[^><]{3,})"), html_spec)
            if(_cur.last_sector.sign == "T07" and _cur.pol_num == 0):
                remarks += re.findall(re.compile("(At\s*or[^<>]+)"), html_spec)
            remarks = [re.sub(re.compile("[\n\t]"), " ", rem) for rem in remarks]
            if(len(canpos_list) == 0):
                assert(len(remarks) == 0)
                continue
            _print(remarks)
            _cur.last_sector.append_polygon( pol_pool, Polygon(canpos_list), remarks )
            _cur.pol_num += 1
        else:
            pass
    _cur = None
    _print( "len(sectors)=" +str( len(sectors) ))
    _print( "sum(sectors.num_polygons)=" +str( sum([sec.num_polygons() for sec in sectors])))

    for r in [8, 4]:
        _print("json-len(round={}): {}".format( r, 
            len( str( json.dumps(Simplifier(sectors, pol_pool, r).result) ))))
    
    simplifier = Simplifier(sectors, pol_pool, CANPOS_ROUND_NUM)
    data = {'ver': VERSION}
    data.update( simplifier.result )

    _print( "len(data['sectors'])=" + str( len(data['sectors']) ) )
    _print( "len(data['polygons'])=" + str( len(data['polygons'])))

    assert( sum([sec.num_polygons() for sec in sectors]) > len(data['polygons']) )
    assert( len(sectors) == len(data['sectors']))
    jsondata = json.dumps(data, indent=2)

    if (is_debug): return

    print(SECTORS_VAR_NAME + " =")
    print(jsondata + ";")
    
def __print(s):
    #print("[DEBUG] " + str(s))
    print(str(s))
def __nop_print(s):
    pass
    
def test():
    Polygon.test()
    PolygonPool.test()
    
def main():
    is_debug = "--debug" in sys.argv
    
    test()
    html_raw = open(ENR2_1_PATH, 'r').read()
    soup = BeautifulSoup(html_raw, "html.parser")
    main_div = soup.find('div', {'id': 'ENR-2.1'})
    assert main_div, "no main id div."
    tables = main_div.find_all('table')

    print_acc_sector_boundaries(tables[1], is_debug and __print or __nop_print, is_debug)
    

if(__name__ == '__main__'):
    main()

