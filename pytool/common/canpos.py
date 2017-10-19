
class Canpos:
    def __init__(self, east, north):
        assert(self.iscoord(east, north)), "({}, {})".format(east, north)
        self.east  = east
        self.north = north
        x, y = self.coord2canpos(east, north)
        assert(self.iscanpos(x, y))
        self.x = x
        self.y = y
    @staticmethod
    def isnum(i):
        return isinstance(i, float) or isinstance(i, int)
    @staticmethod
    def iscoord(east, north):
        return Canpos.isnum(east) and Canpos.isnum(north) and \
            -180 <= east and east <= 180 and -90 <= north and north <= 90
    @staticmethod
    def iscanpos(x, y):
        return Canpos.isnum(x) and Canpos.isnum(y) and \
            0 <= x and x <= 360 and 0 <= y and y <= 180
    @staticmethod
    def coord2canpos(east, north):
        assert(Canpos.iscoord(east, north))
        return [east + 180.0, north * -1 + 90.0]
    @staticmethod
    def canpos2coord(x, y):
        assert(Canpos.iscanpos(x, y))
        return [x - 180.0, (y - 90.0) * -1]
    

if __name__ == "__main__":
    import random
    for i in range(0, 1000):
        if i % 100 == 0:
            print("test[" + str(i) + "]")
        e, n = (random.uniform(-180, 180), random.uniform(-90, 90))
        c = Canpos(e, n)
        e2, n2 = Canpos.canpos2coord(c.x, c.y)
        assert(round(e) == round(e2) and round(n) == round(n2))
        #print((e,n,e2,n2))
    print("ok!")
