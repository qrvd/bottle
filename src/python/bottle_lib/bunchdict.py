import json

class BunchDict(dict):
    
    def __init__(self, other=None):
        if other:
            dict.__init__(self, other)
            self.__dict__.update(other)
        else:
            dict.__init__(self)

    def __setattr__(self, name, val):
        self[name] = val

    def __getattr__(self, name):
        return self[name] 

    def __str__(self):
        return json.dumps(self, indent=4, sort_keys=True)

