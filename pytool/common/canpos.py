import re

class Canpos:
    MULT = 1.0
    SCALE_Y = 111 / 91;

    def __init__(self, east, north):
        assert self.iscoord(east, north), "({}, {})".format(east, north)
        self.east  = east
        self.north = north
        x, y = self.coord2canpos(east, north)
        assert self.iscanpos(x, y)
        self.x = x
        self.y = y

    def round(self, r):
        if r is None:
            return self
        self.x, self.y = [round(a, r) for a in [self.x, self.y]]
        return self

    def to_round(self, r):
        c = self.dup()
        return c.round(r)

    def to_r(self):
        return [self.x, self.y]

    def to_arr(self):
        return self.to_r()

    def dup(self):
        return Canpos(self.east, self.north)

    def __eq__(self, other):
        # DO NOT USE 'is' statements in this comparison
        return self.__class__ == other.__class__ and \
            self.to_r() == other.to_r()

    @staticmethod
    def isnum(i):
        return isinstance(i, float) or isinstance(i, int)

    @classmethod
    def iscoord(cls, east, north):
        return cls.isnum(east) and cls.isnum(north) and \
            -180 <= east and east <= 180 and -90 <= north and north <= 90

    @classmethod
    def iscanpos(cls, x, y):
        return cls.isnum(x) and cls.isnum(y) and \
            0 <= x and x <= 360*cls.MULT and 0 <= y and \
            y <= (180 * cls.MULT * cls.SCALE_Y)

    @classmethod
    def coord2canpos(cls, east, north):
        assert cls.iscoord(east, north)
        x = (east + 360 if east < 0 else east) * cls.MULT
        y = (north * -1 + 90) * cls.MULT * cls.SCALE_Y
        return [x, y]

    @classmethod
    def canpos2coord(cls, x, y):
        assert cls.iscanpos(x, y)
        x /= cls.MULT; y /= cls.MULT * cls.SCALE_Y
        east  = x - 360 if x > 180 else x
        north = (y - 90) * -1
        return [east, north]

    AIP_COORD_RE = re.compile('([0-9]+)N([0-9]+)E')

    @classmethod
    def canpos_list_by_aip_coord(cls, s):
        strs = ["{}N{}E".format(p[0], p[1]) for p
                in re.findall(cls.AIP_COORD_RE, s) ] #[('390010', '1403200'),...)]
        return [cls.canpos_by_aip_coord(s) for s in strs]

    @classmethod
    def canpos_by_aip_coord(cls, s): # ex: "4545N14000E" / "410010N1405546E"
        assert cls.is_aip_coord_str(s)
        m = cls.AIP_COORD_RE.match(s);
        has_min = len(m.group(0)) >= 12
        north = east = 0.0
        north_str, east_str = m.group(1), m.group(2)
        if has_min:
            north += float(north_str[-2:]) / 3600
            east  += float( east_str[-2:]) / 3600
            north_str = north_str[:-2]
            east_str  = east_str[:-2]
        north += float(north_str[-2:]) / 60
        east  += float( east_str[-2:]) / 60
        north_str = north_str[:-2]
        east_str  = east_str[:-2]
        assert len([x for x in [north_str, east_str] if len(x)>0 and len(x)<=3])==2, [s]
        north += float(north_str)
        east  += float(east_str)
        return Canpos(east, north)

    @classmethod    
    def is_aip_coord_str(cls, s):
        return isinstance(s, str) and bool( cls.AIP_COORD_RE.match(s) )


# Two step canpos converter for continental polygons which is movable
class WmapCanpos(Canpos):
    MULT = Canpos.MULT
    SCALE_Y = Canpos.SCALE_Y
    INTERMEDIATE_GREENICHE_X = 0

    def __init__(self, east, north):
        assert Canpos.iscoord(east, north)
        self.east = east
        self.north = north
        # first step: x is simply multiplied
        self.x, self.y = self.coord2canpos(east, north)

    # second step: move to easter.
    def transit_western_to_east(self):
        self.x += 360

    @classmethod
    def coord2canpos(cls, east, north):
        x = (east) * cls.MULT
        y = (north * -1 + 90) * cls.MULT * cls.SCALE_Y
        return [x, y]
    
if __name__ == "__main__":
    import random
    for i in range(0, 1000):
        if i % 100 == 0:
            print("test[" + str(i) + "]")
        e, n = (random.uniform(-180, 180), random.uniform(-90, 90))
        c = Canpos(e, n).round(1000)
        e2, n2 = Canpos.canpos2coord(c.x, c.y)
        assert round(e) == round(e2) and round(n) == round(n2), \
            "{}, {}, {}, {}".format(e, e2, n, n2)
    print("ok!")
