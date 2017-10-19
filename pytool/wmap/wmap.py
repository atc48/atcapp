# original json from: https://github.com/markmarkoh/datamaps
# GeoJSON: https://ja.wikipedia.org/wiki/GeoJSON

import json
import pprint
import copy
import time

import sys
sys.path.append('../common/')
import canpos

class Point:
    def __init__(self, arr):
        assert(self.iscoord(arr))
        self.east  = float(arr[0])
        self.north = float(arr[1])
        self.canpos = canpos.WmapCanpos(arr[0], arr[1])
    @staticmethod
    def isnum(i):
        return isinstance(i, float) or isinstance(i, int)
    @staticmethod
    def iscoord(a):
        return len(a) == 2 and Point.isnum(a[0]) and Point.isnum(a[1])

class Polygon:
    def __init__(self, arr):
        assert(len(arr) >= 1)
        points_list = [[Point(r) for r in inarr] for inarr in arr]
        self.points = points_list[0]
        self.hole_points_list  = points_list[1:]
        self.sub_points = self.transit_western_x_to_east() or None
    def min_x(self):
        return min([p.canpos.x for p in self.points])
    def max_x(self):
        return max([p.canpos.x for p in self.points])
    def transit_western_x_to_east(self):
        if (canpos.WmapCanpos.INTERMEDIATE_GREENICHE_X <= self.min_x()): return None
        trans = lambda p: p.canpos.transit_western_to_east()
        if(self.max_x() <= canpos.WmapCanpos.INTERMEDIATE_GREENICHE_X):
            for p in self.points: trans(p)
            for points in self.hole_points_list:
                for p in points: trans(p)
            return None
        points_dup = copy.deepcopy(self.points)
        for p in points_dup: trans(p)
        return points_dup
    
class Country:
    def __init__(self, data):
        assert(isinstance(data, dict) and data['type'] == 'Feature')
        self.name = self.str(data['properties']['name'])
        self.code = self.str(data['id'])
        if data['geometry'] == None:
            self.geotype = 'None'
            return None
        self.geotype = self.str(data['geometry']['type'])
        assert((self.geotype == 'MultiPolygon' or self.geotype == 'Polygon') and \
               isinstance(data['geometry']['coordinates'], list))
        self.coords = data['geometry']['coordinates']
        self.polygons = [ Polygon(self.coords) ] if (self.geotype == 'Polygon') else \
                        [ Polygon(coords) for coords in self.coords ]
        self.raw = data
    @staticmethod
    def str(s):
        assert(isinstance(s, str))
        return s
    
class MapData:
    def __init__(self, path):
        file = open(path, 'r')
        data = json.load(file)
        # data = {'type': 'FeatureCollection', 'features': [Array of {Feature}] }
        file.close()
        assert(data['type'] == 'FeatureCollection')
        self.countries = [Country(f) for f in data['features']]
        for c in self.countries:
            assert((c.geotype == 'Polygon' and len(c.polygons) == 1) or \
                   (c.geotype == 'MultiPolygon' and len(c.polygons) >= 1) or \
                   (c.geotype == 'None'))
            # array of [
        #   {'type': 'Feature',
        #    'properties': {'name': 'Japan'},
        #    'geometry': {'type': 'MultiPolygon',
        #                 'coordinates': [[
        #     [[134.638428, 34.149234], [134.766379, 33.806335], [134.203416, 33.201178], [133.79295, 33.521985], [133.280268, 33.28957], [133.014858, 32.704567], [132.363115, 32.989382], [132.371176, 33.463642], [132.924373, 34.060299], [133.492968, 33.944621], [133.904106, 34.364931], [134.638428, 34.149234]]], ... ]]},
        #     'id': 'JPN'}
        #
        # coorinates: [[Point, Point, ..],
    def filter(self):
        self.countries = [c for c in self.countries if(c.geotype != 'None')]
        return self
    def find_country_by_name(name):
        founds = [c for c in self.countries if c.name == name]
        assert len(founds) == 1, name
        return founds[0]
    def simplify(self, round_):
        # {'JPN': [{p:[[1,2][3,4]..], h:[[1,2][3,4]..]} ..], ..}
        result = {}
        for country in self.countries:
            polygon_hashes = []
            for polygon in country.polygons:
                polygon_h = {'p': [p.canpos.round(round_).to_r() for p in polygon.points]}
                if( len(polygon.hole_points_list) > 0 ):
                    polygon_h['h'] = [
                        [p.canpos.round(round_).to_r() for p in points] for points in
                            polygon.hole_points_list
                        ]
                if(polygon.sub_points):
                    polygon_h['s'] = [p.canpos.round(round_).to_r() for p in polygon.sub_points]
                polygon_hashes.append(polygon_h)
            result[country.code] = polygon_hashes
        return result

def output_json():
    VAR_NAME = "atcapp.DATA_WORLDMAP"
    lo = MapData('./world.json').filter()
    hi = MapData('./world.hires.json').filter()
    if(False):
        print(len(str(lo.simplify(None))))
        print(len(str(lo.simplify(4))))
        print(len(str(lo.simplify(2))))
        print(len(str(hi.simplify(None)['JPN'])))
        print(len(str(hi.simplify(4)['JPN'])))
    lo_json = lo.simplify(2)
    hi_json = hi.simplify(4)
    result = lo_json
    result['JPN'] = hi_json['JPN']
    print(VAR_NAME + " = " + str(result) + ";")

def show_debug():
    low  = MapData('./world.json')
    for country in low.countries:
        print("{}, {}, {}, {}, {}".format(country, country.code, country.name, \
                                          country.geotype, len(country.polygons) ))
    high = MapData('./world.hires.json');
    for country in low.countries:
        print("{}, {}, {}, {}, {}".format(country, country.code, country.name, \
                                          country.geotype, len(country.polygons) ))
    print("low:  len(all)={}, len(not-none)={}".format(
        len(low.countries), len(low.filter().countries)))
    print("high: len(all)={}, len(not-none)={}".format(
        len(high.countries), len(high.filter().countries)))

    # Normal-Polygon, Hole-having-Polygon, MultiPolygon
    for c in [low.countries[0], \
              [c for c in low.countries if len(c.polygons[0].hole_points_list) > 0 ][0], \
              [c for c in low.countries if c.geotype == 'MultiPolygon'][0]]:
        print("--")
        print(c.geotype)
        print(c.polygons)
        print(c.polygons[0].points)
        print(c.polygons[0].hole_points_list)
    
    
if __name__ == "__main__":
    #show_debug()
    output_json();
