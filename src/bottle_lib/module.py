from .bunchdict import BunchDict

class ModuleInserter(object):
    
    def __init__(self, name, moduser):
        self.name = name
        self.moduser = moduser

    def __enter__(self):
        self.bunch_dict = BunchDict()
        return self.bunch_dict

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type or exc_val or exc_tb:
            return False

        # always convert to dict before querying
        # (any key could've been overwritten, including "items")
        d = dict(self.bunch_dict)

        # using .items instead of .iteritems (compatibility with 2.x)
        for k, v in d.items():
            if k in self.moduser:
                entry = self.moduser[k]
                raise RuntimeError("Error in module(\"{}\"):\n" +
                    "\tThe variable name \"{}\" is already used in module(\"{}\")\n" +
                    "\tPlease try a different name!" % (self.name, k, entry['module'])
                )
            else:
                self.moduser[k] = { 'module': self.name, 'default': v }

        # don't suppress exceptions
        return False

