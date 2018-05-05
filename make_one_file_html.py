#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""

Output the prototype html for atcapp,
which includes js, css and image sources all.
The html will be output to your stdout.

Usage:
  python3 make_one_file_html.py > atc48.html
  open atc48.html

"""


import os
import base64
import rjsmin
import rcssmin
import json


NO_COMPRESS = False

API_FLIGHTS = "http://atc48.com/api/mock_flights.json"

APP_ROOT_DIR = os.path.dirname(__file__)
JS_ROOT_DIR = os.path.join(APP_ROOT_DIR, "jsapp")
CSS_ROOT_DIR = os.path.join(APP_ROOT_DIR, "css")
ASSETS_DIR = os.path.join(APP_ROOT_DIR, "img")
JS_DIRS = [
    os.path.join(JS_ROOT_DIR, subdir) for subdir in [
        "lib",
        "common/__init__.js",
        "common",
        ""
    ]
    # the loading of files must be this order!
]


HTML_TPL = '''
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="format-detection" content="telephone=no" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<meta http-equiv="Content-Style-Type" content="text/css" />
<title>ATC48</title>
<style type="text/css">
<!--
${CSS_MINIFIED}
-->
</style>
<script type="text/javascript">
<!--
${JS_MINIFIED}
-->
</script>
</head>

<body>
<div id="atcapp-outer">
  <canvas id="atcapp">
  </canvas>
</div>

<script>
 $(function () {
   var assetsBase64Map = ${ASSETS_BASE64_MAP};
   var atc = atcapp.boot("atcapp", "fix-search", "debugger", {assets_dir: "${ASSETS_DIR}", assets_base64_map: assetsBase64Map, flights_api_path: "${API_FLIGHTS}" });
});
</script>

<div id="atcapp-external">
  <div class="search-tool" id="fix-search" >
    <form action="javascript:void(0);">
      <div class="completion" style="display:none;">
      </div>
      <div class="input-outer">
<input class="form-control" type="text" placeholder="Search... FIX in RJJJ" />
      </div>
    </form>
  </div>
</div>

</body>
</html>
'''


def make_filepath_list(directories, ext):
    res = []
    for each_dir in directories:
        for cur_path, dirs, files in os.walk(each_dir, topdown=True, onerror=None, followlinks=True):
            for fname in files:
                fpath = os.path.join(cur_path, fname)
                if fpath.endswith(ext) and fpath not in res:
                    res.append(fpath)
    assert len(set(res)) == len(res), "some file duplicated."
    return res


def make_minified(filepath_list, fn_minify):
    premsg = "/**\n * This is minified of: \n *  " + \
        str(filepath_list) + "\n **/\n"
    joined = "\n".join([
        open(p, 'r').read()
        for p
        in filepath_list
    ])
    minified = fn_minify(joined)
    return premsg + minified


def css_by_path(filepath):
    return open(filepath, 'r').read()


def make_assets_path_to_base64_map(filepath_list):
    return {
        path: "data:image/{ext};base64,".format(ext=os.path.splitext(path)[1][1:]) +
        base64.encodestring(open(path, 'rb').read()).decode('ascii')
        for path
        in filepath_list
    }


def main():
    html = HTML_TPL

    js_list = make_filepath_list(JS_DIRS, ".js")
    js_minified = make_minified(
        js_list, (lambda s: s) if NO_COMPRESS else rjsmin.jsmin)
    html = html.replace("${JS_MINIFIED}", js_minified)

    css_list = make_filepath_list([CSS_ROOT_DIR], ".css")
    css_minified = make_minified(
        css_list, (lambda s: s) if NO_COMPRESS else rcssmin.cssmin)
    html = html.replace("${CSS_MINIFIED}", css_minified)

    assets_list = make_filepath_list([ASSETS_DIR], "")
    assets_base64_map = make_assets_path_to_base64_map(assets_list)
    assets_base64_map_json = json.dumps(assets_base64_map)
    html = html.replace("${ASSETS_DIR}", ASSETS_DIR).replace(
        "${ASSETS_BASE64_MAP}", json.dumps(assets_base64_map))

    html = html.replace("${API_FLIGHTS}", API_FLIGHTS)

    print(html.strip())


if __name__ == '__main__':
    main()
