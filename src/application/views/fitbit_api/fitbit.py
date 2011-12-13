import logging
logging.debug("loading fitbit.py")

import time
import datetime
import simplejson

from google.appengine.api.urlfetch import DownloadError
from google.appengine.ext import db
from google.appengine.api import users
from application.decorators import login_required

from utils import *
import oauth
from flask import request, render_template, flash, url_for, redirect

CONSUMER = oauth.OAuthConsumer(CONSUMER_KEY, CONSUMER_SECRET)

@login_required
def unauth():
    "/fitbit/unauth"
    user = users.get_current_user().email() #request.session.user
    ts = FitbitToken.getFor(user)
    ts.access_token = ''
    ts.unauthed_token = ''
    db.put(ts)
    logging.warning("Unauthenticated %s"%ts.user)
    return redirect(url_for('home'))

@login_required
def auth():
    "/fitbit/auth"
    token = get_unauthorised_request_token(CONSUMER)
    auth_url = get_authorisation_url(CONSUMER, token)
    user = users.get_current_user().email()
    ts = FitbitToken.getFor(user)
    if ts.access_token:
        return redirect(url_for('home'))
    ts.unauthed_token = token.to_string()
    ts.put()
    return redirect(auth_url)

@login_required
def return_():
    "/fitbit/return"
    user = users.get_current_user().email()
    ts = FitbitToken.getFor(user)
    if not ts.unauthed_token:
        return "No un-authed token cookie"
    token = oauth.OAuthToken.from_string(ts.unauthed_token)
    if token.key != request.values['oauth_token']:
        return ("Something went wrong! Tokens do not match. Our key is %s, "
                "and we got %s back."%(token.key,request.values['oauth_token']))
    access_token = exchange_request_token_for_access_token(
        CONSUMER, token,
        parameters={'oauth_verifier': request.values['oauth_verifier']})
    if not access_token.key and not access_token.secret:
        return "No access token; it didn't work. Check the logs."
    ts.access_token = access_token.to_string()
    ts.unauthed_token = ''
    ts.put()
    fitbit_name = get_fitbit_name()
    ts.fitbit_name = fitbit_name
    ts.put()
    return redirect(url_for('home'))

def get_fitbit_name():
    user = users.get_current_user().email()
    ts = FitbitToken.getFor(user)
    access_token = oauth.OAuthToken.from_string(ts.access_token)
    oauth_request = request_oauth_resource(CONSUMER, GET_USER_INFO, access_token)
    info = fetch_response(oauth_request)
    logging.info("json result of oauth request: %r"%info)
    if "displayName" in info:
        creds = simplejson.loads(info)
        return creds['user']['displayName']
    else:
        logging.warning("Auth token didn't work: %s"%access_token)
        return ''

def get_intraday_steps():
    user = users.get_current_user().email()
    ts = FitbitToken.getFor(user)
    access_token = oauth.OAuthToken.from_string(ts.access_token)
    oauth_request = request_oauth_resource(CONSUMER, GET_INTRADAY_STEPS, access_token)
    json = fetch_response(oauth_request)
    logging.info("json result of get intraday steps: %s"%json)
    return json

def post_tweet(user, tweet):
    ts = FitbitToken.getFor(user)
    try:
        json = update_status(CONSUMER,oauth.OAuthToken.from_string(
                ts.access_token), tweet)
    except DownloadError:
        logging.warning("Failed to post progress tweet for user %s"%user)
        json = update_status(CONSUMER,oauth.OAuthToken.from_string(
                ts.access_token), tweet)
    except TypeError:
        logging.error("Errored out trying to post tweet %s for user %s."%(
                tweet, user))
        json = None
    return json

class FitbitToken(db.Model):
    user = db.StringProperty(required=True)
    access_token = db.TextProperty(default='')
    unauthed_token = db.TextProperty(default='')
    fitbit_email = db.StringProperty(default='')

    def __init__(self, *args, **kargs):
        kargs["key_name"] = kargs["user"]
        return db.Model.__init__(self, *args, **kargs)

    @classmethod
    def getFor(cls, user):
        ts = FitbitToken.get_by_key_name(user)
        if not ts:
            ts = FitbitToken(user=user)
        return ts

    def __repr__(self): return self.__str__()
    def __str__(self):
        return "<FitbitToken for %s: %s>"%(self.user, ', '.join(
                ["%s=%s"%(p, getattr(self, p)) for p in
                 "fitbit_email", "access_token", "unauthed_token"
                 if getattr(self, p)]))
