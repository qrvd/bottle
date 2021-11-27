## bottle - a simple discord bot framework

Bottle is a framework designed to make it easy for anyone to start creating Discord bots.
Sending a message is as easy as writing a `print` statement. For example, here is the code for a command that
prints "Hello, Bottle!"

```python
print('Hello, Bottle!')
```

And here is code for a command to greet the user:
```python
from bottle import user
print("Hello, " + user.name + "!")
```

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
the included Python/JS libraries as seen in the example commands (`bot/commands`).

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

If you use the Python/NS libraries, all changes to the "user" object will be automatically saved,
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

By default, commands that you run on the command-line will behave as if your bot
was the user that ran the command. But sometimes you may want to test them with another user,
which can be done simply once you have the user's Discord ID.

#### On Linux/macOS:

```bash
# Tell Bottle to run commands from the command-line as if the user "12345678910" ran them.
~:$ export BOTTLE_USER_ID=12345678910 
~:$ python balance.py
Your balance is: 0

# Return to using the bot's "user":
~:$ export BOTTLE_USER_ID=bot
~:$ python balance.py
Your balance is: 2
```

#### On Windows:

```batch
:: Tell Bottle to run commands from the command-line as if the user "12345678910" ran them.
~:$ set BOTTLE_USER_ID=12345678910
~:$ python balance.py 
Your balance is: 0

:: Return to using the bot's "user":
~:$ set BOTTLE_USER_ID=bot
~:$ python balance.py
Your balance is: 2
```
