import sys
import re
from functools import reduce
from bs4 import BeautifulSoup

sys.path.append('../common/')
from canpos import Canpos


ENR2_1_PATH = "./data/aip-enr-2.1.html"
FUKUOKA_FIR_VAR_NAME = "atcapp.DATA_FUKUOKA_FIR"

def print_fukuoka_fir(table):
    ems = table.find('tbody').find('tr').find('td').find_all('em')
    coord_strs = [em.get_text() for em in ems if em.get_text() ]
    coord_strs = reduce(lambda x,y: x + y, [str.split('-') for str in coord_strs])
    #          => ['4545N14000E', '4545N14200E', ...]
    assert coord_strs
    canpos_list = [
        Canpos.canpos_by_aip_coord(s) for s in coord_strs
    ]
    json = {'p': [c.round(4).to_r() for c in canpos_list]}
    print("{} = {};".format(FUKUOKA_FIR_VAR_NAME, str(json)))

def main():
    html_raw = open(ENR2_1_PATH, 'r').read()
    soup = BeautifulSoup(html_raw, "html.parser")
    main_div = soup.find('div', {'id': 'ENR-2.1'})
    assert main_div, "no main id div."
    tables = main_div.find_all('table')

    print_fukuoka_fir(tables[0])
    

if(__name__ == '__main__'):
    main()
