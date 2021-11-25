import bottle_lib.lib as lib
import os

# Setup context for command
user = lib.get_current_user()

if os.environ.get('_BOTTLE_NO_AUTOSAVE') is None:
    # save changes automatically
    def save_current_user():
        lib.save_user(user)
    import atexit
    atexit.register(save_current_user)
    del save_current_user

