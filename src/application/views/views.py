# -*- coding: utf-8 -*-
from __future__ import division
"""
views.py

URL route handlers

Note that any handler params must match the URL route params.
For example the *say_hello* handler, handling the URL route '/hello/<username>',
  must be passed *username* as the argument.

"""

import datetime
import time
import logging

from google.appengine.api import users
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError

from flask import request, render_template, flash, url_for, redirect

from application import app
from application.models import ExampleModel
from application.decorators import login_required, admin_required
from application.forms import ExampleForm
from application.views.fitbit_api import fitbit

from django.utils import simplejson

import application.settings

@app.context_processor
def inject_var():
    context = {}
    context["user"] = users.get_current_user()
    if context["user"]:
        context["ts"] = fitbit.FitbitToken.getFor(context["user"].email())
        context["logout_url"] = users.create_logout_url("/")
        context["raw"] = simplejson.loads(fitbit.get_intraday_steps())
        context["data"] = context["raw"]["activities-log-steps-intraday"]["dataset"]
        context["date"] = context["raw"]["activities-log-steps"][0]["dateTime"]
        context["total"] = context["raw"]["activities-log-steps"][0]["value"]
    return context

def home():
    return render_template('home.html')

def demo_spiral():
    return render_template("demo-spiral.html")

def demo_flora():
    return render_template("demo-flora.html")
    
def spiral():
    return render_template("spiral.html")
    
def flora():
    return render_template("flora.html")

def say_hello(username):
    """Contrived example to demonstrate Flask's url routing capabilities"""
    return 'Hello %s' % username

def raw():
    return render_template("raw.html", data=fitbit.get_intraday_steps())

def list_examples():
    """List all examples"""
    examples = ExampleModel.all()
    return render_template('list_examples.html', examples=examples)

# todo: put these somewhere
def epoch(dt):
    if not dt:
        return 0
    return time.mktime(dt.utctimetuple()) + 0.000001 * dt.microsecond

def fromEpoch(seconds):
    return datetime.utcfromtimestamp(seconds)


@login_required
def new_example():
    """Add a new example, detecting whether or not App Engine is in read-only mode."""
    form = ExampleForm()
    if form.validate_on_submit():
        example = ExampleModel(
                    example_id = form.example_id.data,
                    example_title = form.example_title.data,
                    added_by = users.get_current_user()
                    )
        try:
            example.put()
            flash(u'Example successfully saved.', 'success')
            return redirect(url_for('list_examples'))
        except CapabilityDisabledError:
            flash(u'App Engine Datastore is currently in read-only mode.', 'failure')
            return redirect(url_for('list_examples'))
    return render_template('new_example.html', form=form)


@admin_required
def admin_only():
    """This view requires an admin account"""
    return 'Super-seekrit admin page.'


def warmup():
    """App Engine warmup handler
    See http://code.google.com/appengine/docs/python/config/appconfig.html#Warming_Requests

    """
    return ''
