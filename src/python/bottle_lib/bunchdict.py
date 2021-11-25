import json

class BunchDict(dict):
    
    def __init__(self,**kw):
        dict.__init__(self,kw)
        self.__dict__.update(kw)

    def __setattr__(self, name, val):
        self[name] = val

    def __getattr__(self, name):
        return self[name] 

    def __str__(self):
        return json.dumps(self, indent=4, sort_keys=True)

