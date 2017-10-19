
class Canpos:
    MULT = 10.0
    ROUND = 4

    def __init__(self, east, north):
        assert(self.iscoord(east, north)), "({}, {})".format(east, north)
        self.east  = east
        self.north = north
        x, y = self.coord2canpos(east, north)
        assert(self.iscanpos(x, y))
        self.x = x
        self.y = y
    def round(self, r=ROUND):
        if r==None: return self
        self.x, self.y = [round(a, r) for a in [self.x, self.y]]
        return self
    def to_r(self):
        return [self.x, self.y]
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
            0 <= x and x <= 360*cls.MULT and 0 <= y and y <= 180*cls.MULT
    @classmethod
    def coord2canpos(cls, east, north):
        assert(cls.iscoord(east, north))
        return [(east + 180.0) * cls.MULT, (north * -1 + 90.0) * cls.MULT]
    @classmethod
    def canpos2coord(cls, x, y):
        assert(cls.iscanpos(x, y))
        x /= cls.MULT; y /= cls.MULT
        return [x - 180.0, (y - 90.0) * -1]
    

if __name__ == "__main__":
    import random
    for i in range(0, 1000):
        if i % 100 == 0:
            print("test[" + str(i) + "]")
        e, n = (random.uniform(-180, 180), random.uniform(-90, 90))
        c = Canpos(e, n).round()
        e2, n2 = Canpos.canpos2coord(c.x, c.y)
        assert round(e) == round(e2) and round(n) == round(n2), \
            "{}, {}, {}, {}".format(e, e2, n, n2)
        #print((e,n,e2,n2))
        #print(c.round().to_r())
    print("ok!")
