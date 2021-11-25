import sys
import json

def emit(*args):
    cmd = {'action': args[0], 'args': args[1:]}
    j = json.dumps(cmd)
    print(j, file=sys.stderr)

class UserMessage(object):
    
    def __init__(self, channel_id, msg_id, text):
        self._emit = lambda *args: emit(args[0], channel_id, msg_id, *args[1:])
        self.id = str(msg_id)
        self.channel_id = str(channel_id)
        self.text = text

    def delete(self):
        self._emit('delete')

    def react(self, emoji):
        self._emit('react', emoji)

    def edit(self, text):
        self._emit('edit', text)

    def __str__(self):
        return {
            'type': 'message',
            'id': self.id,
            'channel_id': self.channel_id,
            'text': self.text
        }

