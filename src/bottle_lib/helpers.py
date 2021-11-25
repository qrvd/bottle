from os import path

def enumerate_dirs(starting_path):
    curdir = path.abspath(starting_path)
    sep = path.sep
    while len(curdir) > 0:
        yield curdir
        end = curdir.rindex(sep)
        curdir = curdir[0:end]
