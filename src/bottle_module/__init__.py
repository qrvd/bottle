from bottle_lib.bunchdict import BunchDict
from bottle_lib.module import ModuleInserter
import atexit

# Setup context for modules.py
_module_user = None
_module_list = None
def module(name):
    global _module_user
    global _module_list
    if not _module_user:
        _module_user = BunchDict()
        _module_list = []
        def print_module_user():
            print(_module_user)
        atexit.register(print_module_user)
    if name in _module_list:
        raise RuntimeError("The module \"{}\" has already been created earlier in this file." % name)
    else:
        _module_list.append(name)
    return ModuleInserter(name, _module_user)

