# original json from: https://github.com/markmarkoh/datamaps
# GeoJSON: https://ja.wikipedia.org/wiki/GeoJSON

import json
import pprint
import copy
import time
import sys

sys.path.append('../common/')
from canpos import WmapCanpos


VAR_NAME = "atcapp.DATA_WORLDMAP"
LOW_FILEPATH  = "./data/world.json"
HIGH_FILEPATH = "./data/world.hires.json"

class Point:
    def __init__(self, arr):
        assert self.iscoord(arr)
        self.east  = float(arr[0])
        self.north = float(arr[1])
        self.canpos = WmapCanpos(arr[0], arr[1])

    @staticmethod
    def isnum(i):
        return isinstance(i, float) or isinstance(i, int)

    @staticmethod
    def iscoord(a):
        return len(a) == 2 and Point.isnum(a[0]) and Point.isnum(a[1])

class Polygon:
    def __init__(self, arr):
        assert len(arr) >= 1
        points_list = [[Point(r) for r in inarr] for inarr in arr]
        self.points = points_list[0]
        self.hole_points_list  = points_list[1:]
        self.sub_points = self.transit_western_x_to_east() or None

    def min_x(self):
        return min([p.canpos.x for p in self.points])

    def max_x(self):
        return max([p.canpos.x for p in self.points])

    def transit_western_x_to_east(self):
        if WmapCanpos.INTERMEDIATE_GREENICHE_X <= self.min_x():
            return None

        trans = lambda p: p.canpos.transit_western_to_east()
        if self.max_x() <= WmapCanpos.INTERMEDIATE_GREENICHE_X:
            for p in self.points:
                trans(p)
            for points in self.hole_points_list:
                for p in points:
                    trans(p)
            return None

        points_dup = copy.deepcopy(self.points)
        for p in points_dup: trans(p)
        return points_dup


class Country:
    def __init__(self, data):
        assert isinstance(data, dict) and data['type'] == 'Feature'

        self.name = self.str(data['properties']['name'])
        self.code = self.str(data['id'])

        if data['geometry'] is None:
            self.geotype = 'None'
            return None

        self.geotype = self.str(data['geometry']['type'])
        assert (self.geotype == 'MultiPolygon' or self.geotype == 'Polygon') and \
               isinstance(data['geometry']['coordinates'], list)
        self.coords = data['geometry']['coordinates']
        self.polygons = [ Polygon(self.coords) ] if (self.geotype == 'Polygon') else \
                        [ Polygon(coords) for coords in self.coords ]
        self.raw = data

    @staticmethod
    def str(s):
        assert isinstance(s, str)
        return s


class MapData:
    def __init__(self, path):
        with open(path, 'r') as f:
            data = json.load(f)
            # data => {'type': 'FeatureCollection', 'features': [Array of {Feature}] }
        assert data['type'] == 'FeatureCollection'

        self.countries = [Country(f) for f in data['features']]
        for c in self.countries:
            assert (c.geotype == 'Polygon' and len(c.polygons) == 1) or \
                   (c.geotype == 'MultiPolygon' and len(c.polygons) >= 1) or \
                   (c.geotype == 'None')
        # data => array of [
        #   {'type': 'Feature',
        #    'properties': {'name': 'Japan'},
        #    'geometry': {'type': 'MultiPolygon',
        #                 'coordinates': [[
        #     [[134.638428, 34.149234], [134.766379, 33.806335], ... ]]},
        #     'id': 'JPN'}
        #
        # coorinates: [[Point, Point, ..],

    def filter(self):
        self.countries = [c for c in self.countries if c.geotype != 'None']
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
                if polygon.hole_points_list :
                    polygon_h['h'] = [
                        [p.canpos.round(round_).to_r() for p in points]
                        for points in polygon.hole_points_list
                    ]
                if polygon.sub_points:
                    polygon_h['s'] = [p.canpos.round(round_).to_r()
                                      for p in polygon.sub_points]
                polygon_hashes.append(polygon_h)
            result[country.code] = polygon_hashes
        return result


def output_json():
    lo = MapData(LOW_FILEPATH).filter()
    hi = MapData(HIGH_FILEPATH).filter()
    lo_json = lo.simplify(2)
    hi_json = hi.simplify(4)
    result = lo_json
    result['JPN'] = hi_json['JPN']

    print(VAR_NAME + " = " + str(result) + ";")

def show_debug():
    low  = MapData(LOW_FILEPATH)
    for country in low.countries:
        print("{}, {}, {}, {}, {}".format(country, country.code, country.name, \
                                          country.geotype, len(country.polygons) ))
    high = MapData(HIGH_FILEPATH);
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
    if "--debug" in sys.argv:
        show_debug()
        exit()

    output_json()
