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

from models import ExampleModel
from decorators import login_required, admin_required
from forms import ExampleForm

import settings
import gdata.spreadsheets.client
import gdata.spreadsheet.service

# Create an instance of the DocsService to make API calls
gclient = gdata.spreadsheet.service.SpreadsheetsService(
    source=settings.APPLICATION_NAME)

def home():
    return render_template('base.html')

def demo_spiral():
	return render_template("demo-spiral.html")


def say_hello(username):
    """Contrived example to demonstrate Flask's url routing capabilities"""
    return 'Hello %s' % username


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
