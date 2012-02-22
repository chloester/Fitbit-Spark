"""
Initialize Flask app

"""

from flask import Flask
#from flaskext.gae_mini_profiler import GAEMiniProfiler
import application.settings
import secret_keys

app = Flask('application')
app.config.from_object('application.settings')
app.secret_key = secret_keys.CSRF_SECRET_KEY
#GAEMiniProfiler(app)

import urls
