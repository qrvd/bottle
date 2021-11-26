## a simpler-to-use discord bot library

### Quick-start

1. Clone the repository:
```bash
 ~:$ git clone git@github.com:qrvd/bottle.git
```

2. Install the dependencies:

```bash
 ~:$ cd bottle
 ~:$ npm install
```

3. Start the `bottle` script to start running your bot!

```bash
 ~:$ cd bot
 ~:$ ./bottle.sh # on Linux/macOS
 ~:$ bottle.bat  # on Windows
```

### Adding commands

In Bottle, your commands are the files in the `commands/` folder, feel free
to peek in that folder for examples on how it works.

Whatever is printed by your command, will be sent by the bot after the command
finishes running.

### User data

Your users' data are stored as simple JSON files, in the `users/` folder.
Commands can bd written in any programming language, but feel free to use
the included Python library (found in `src/python`).

It allows you to write very simple code. Here is the code for a simple "balance" command:

```python
#!/usr/bin/env python3
from bottle import user

if 'balance' not in user:
    user.balance = 0
else:
    user.balance = user.balance + 1

print("Your balance is: %s" % user.balance)
```

If you use the Python library, all changes to the "user" object will be automatically saved,
and kept for the next time the user runs any other command. That is why the above code is
all that's needed.

### Development tips

You can run your commands directly from the command-line,
which allows for much easier testing/development! Here is an example
of how to run the `balance` command from the command-line:

```bash
~:$ cd commands
~:$ python balance.py
Your balance is: 0
~:$ python balance.py
Your balance is: 1
```

