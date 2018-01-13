import os
import re


ROOT_PATH_REL = "../"
JS_PATTERN = re.compile(r"/jsapp/.*\.js$")
JS_EXCLUSIVE_PATH_PATTERNS = [re.compile(exp) for exp in [
    r"DATA_.*\.js",
    r"/jsapp/lib/"
]]
PY_PATTERN = re.compile(r"/pytool/.*\.py$")
PY_EXCLUSIVE_PATH_PATTERNS = []
PATH_PRINT_IGNORE_PATTERN = re.compile(".*/atcapp")


def path_of_this_file():
    return os.path.dirname( os.path.realpath(__file__) )

def path_of_root():
    return os.path.dirname(
        os.path.realpath( path_of_this_file() + "/" + ROOT_PATH_REL ) )

def files_itr():
    for root, dirs, files in os.walk( path_of_root() ):
        for f in files:
            path = os.path.join(root, f)
            yield path

def files_itr_with_pattern(must_match, exclusives):
    for path in files_itr():
        if must_match.search(path) and not ([1 for ex_pat in JS_EXCLUSIVE_PATH_PATTERNS if ex_pat.search(path)]):
            yield path

def js_itr():
    return files_itr_with_pattern(JS_PATTERN, JS_EXCLUSIVE_PATH_PATTERNS)

def py_itr():
    return files_itr_with_pattern(PY_PATTERN, PY_EXCLUSIVE_PATH_PATTERNS)

def num_lines(path):
    return len(open(path).readlines())

def num_lines_str(path):
    return "{:>4}: {}".format(num_lines(path), PATH_PRINT_IGNORE_PATTERN.sub("", path))

def print_info(itr):
    num = 0
    for path in itr:
        print(num_lines_str(path))
        num += num_lines(path)
    print("SUM: {}".format(num))


def main():

    print("-- js --------------------")
    print_info( js_itr() )

    print("-- py --------------------")
    print_info( py_itr() )


if __name__ == '__main__':
    main()
