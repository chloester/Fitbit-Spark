"""
urls.py

URL dispatch route mappings and error handlers

"""

from flask import render_template

from application import app
from application.views import views
from application.views import fitbit_api
from application.views.fitbit_api import fitbit


## URL dispatch rules
# App Engine warm up handler
# See http://code.google.com/appengine/docs/python/config/appconfig.html#Warming_Requests
app.add_url_rule('/_ah/warmup', 'warmup', view_func=views.warmup)

# Home page
app.add_url_rule('/', 'home', view_func=views.home)

# Fitbit Oauth
app.add_url_rule('/fitbit/unauth', 'fitbit-unauth', view_func=fitbit.unauth)
app.add_url_rule('/fitbit/auth', 'fitbit-auth', view_func=fitbit.auth)
app.add_url_rule('/fitbit/return', 'fitbit-return', view_func=fitbit.return_)

# Visualizations
app.add_url_rule('/spiral', 'spiral', view_func=views.spiral)
app.add_url_rule('/rings', 'rings', view_func=views.rings)
app.add_url_rule('/bucket', 'bucket', view_func=views.bucket)
app.add_url_rule('/pollock', 'pollock', view_func=views.pollock)
app.add_url_rule('/<vis>/<int:year>/<int:month>/<int:day>', 'vis-date', view_func=views.vis_date)

app.add_url_rule('/column', 'column', view_func=views.column)

# Raw data
app.add_url_rule('/raw', 'raw', view_func=views.raw)

# About/Contact
app.add_url_rule('/about', 'about', view_func=views.about)

# Say hello
app.add_url_rule('/hello/<username>', 'say_hello', view_func=views.say_hello)

# Contrived admin-only view example
app.add_url_rule('/admin_only', 'admin_only', view_func=views.admin_only)

## Error handlers
# Handle 404 errors
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# Handle 500 errors
@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

