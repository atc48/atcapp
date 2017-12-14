import math

class KeyMapMaker:

    def __init__(self, objs, get_key, get_inner_key=None, filter_obj=lambda x:x):
        assert isinstance(filter_obj, type(lambda x:0))
        assert isinstance(objs, list) and isinstance(get_key, type(lambda x:0))
        assert None == get_inner_key or isinstance(get_inner_key, type(lambda x:0))
            
        self.objs = objs
        self.get_key  = get_key
        self.get_inner_key = get_inner_key
        self.filter_obj = filter_obj

    def make(self):
        res = {}
        for obj in self.objs:
            key = self.get_key( obj )
            if not self.get_inner_key:
                self.__append_by_key(res, key, obj)
            else:
                inkey = self.get_inner_key(obj)
                self.__append_by_two_keys(res, key, inkey, obj)
        return res

    def __append_by_key(self, res, key, obj):
        assert not self.get_inner_key and \
            (isinstance(key, int) or isinstance(key, str) and len(key) > 0)
        if not key in res:
            res[ key ] = []
        res[key].append( obj )

    def __append_by_two_keys(self, res, key, inkey, obj):
        assert self.get_inner_key and isinstance(key, int)
        assert isinstance(inkey, int) or isinstance(inkey, str) and len(inkey) > 0
        if not key in res:
            res[ key ] = {}
        if not inkey in res[key]:
            res[ key ][ inkey ] = []
        obj_filtered = self.filter_obj( obj )
        assert obj_filtered or isinstance(obj_filtered, int)
        res[ key ][ inkey ].append( obj_filtered )


def test():
    objs = [1,2,3,4,5,1,2,3,44]
    gmap = KeyMapMaker(objs, lambda x:x).make()
    assert gmap == {1: [1,1], 2: [2,2], 3: [3,3], 4: [4], 5: [5], 44: [44]}, gmap

    objs = [1,2,3,4,5,6,7,8,44,48,88]
    gmap = KeyMapMaker(objs, lambda x:math.floor(x/10), lambda x:x%4).make()
    assert gmap == {0:{1:[1,5],2:[2,6],3:[3,7],0:[4,8]}, 4:{0:[44,48]}, 8:{0:[88]}}, \
        gmap
    
    print("test(): ok!")


if __name__ == "__main__":
    test()
