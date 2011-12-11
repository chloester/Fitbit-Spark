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

# Demo pages
app.add_url_rule('/demo-spiral', 'demo-spiral', view_func=views.demo_spiral)
app.add_url_rule('/demo-fauna', 'demo-fauna', view_func=views.demo_fauna)

# Say hello
app.add_url_rule('/hello/<username>', 'say_hello', view_func=views.say_hello)

# Examples list page
app.add_url_rule('/examples', 'list_examples', view_func=views.list_examples)

# Add new example via web form
app.add_url_rule('/example/new', 'new_example', view_func=views.new_example, methods=['GET', 'POST'])

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

