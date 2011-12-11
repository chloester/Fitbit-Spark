import logging
import application
import application.secret_keys

from google.appengine.api import urlfetch
from google.appengine.ext import db

import oauth

signature_method = oauth.OAuthSignatureMethod_HMAC_SHA1()

SERVER = 'www.fitbit.com'
REQUEST_TOKEN_URL = 'https://%s/oauth/request_token' % SERVER
ACCESS_TOKEN_URL = 'https://%s/oauth/access_token' % SERVER
AUTHORIZATION_URL = 'http://%s/oauth/authorize' % SERVER
CALLBACK_URL = 'http://localhost:9001/fitbit/return'

CONSUMER_KEY = application.secret_keys.CONSUMER_KEY
CONSUMER_SECRET = application.secret_keys.CONSUMER_SECRET

# We use this URL to check if Twitter's oAuth worked
BASE = 'https://api.fitbit.com'
GET_USER_INFO = '%s/1/user/-/profile.json' %BASE
TWITTER_FRIENDS = 'https://twitter.com/statuses/friends.json'
TWITTER_UPDATE_STATUS = 'https://twitter.com/statuses/update.json'

def request_oauth_resource(consumer, url, access_token, parameters=None, signature_method=signature_method, http_method="GET"):
    """
    usage: request_oauth_resource( consumer, '/url/', your_access_token, parameters=dict() )
    Returns a OAuthRequest object
    """
    if not parameters: 
        parameters={}
    parameters['oauth_callback'] = CALLBACK_URL
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=access_token, http_method=http_method, http_url=url, parameters=parameters,
    )
    oauth_request.sign_request(signature_method, consumer, access_token)
    #logging.debug('oauth_request: %s'%oauth_request.to_url())
    return oauth_request


def fetch_response(oauth_request):
    url = oauth_request.to_url()
    return urlfetch.fetch(url, method=oauth_request.http_method).content

def get_unauthorised_request_token(consumer, signature_method=signature_method):
    parameters={}
    parameters['oauth_callback'] = CALLBACK_URL
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, http_url=REQUEST_TOKEN_URL, parameters=parameters
    )
    oauth_request.sign_request(signature_method, consumer, None)
    resp = fetch_response(oauth_request)
    token = oauth.OAuthToken.from_string(resp)
    return token


def get_authorisation_url(consumer, token, signature_method=signature_method):
    parameters={}
    parameters['oauth_callback'] = CALLBACK_URL
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=token, http_url=AUTHORIZATION_URL, parameters=parameters
    )
    oauth_request.sign_request(signature_method, consumer, token)
    return oauth_request.to_url()

def exchange_request_token_for_access_token(consumer, request_token, signature_method=signature_method):
    parameters={}
    parameters['oauth_callback'] = CALLBACK_URL
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=request_token, http_url=ACCESS_TOKEN_URL, parameters=parameters
    )
    oauth_request.sign_request(signature_method, consumer, request_token)
    resp = fetch_response(oauth_request)
    return oauth.OAuthToken.from_string(resp) 



def get_user_info(consumer, access_token):
    oauth_request = request_oauth_resource(consumer, GET_USER_INFO, access_token)
    json = fetch_response(oauth_request)
    logging.info("json result of oauth request: %r"%json)
    if 'displayName' in json:
        return json
    return False

def get_friends(consumer, access_token, page=0):
    """Get friends on Twitter"""
    oauth_request = request_oauth_resource(consumer, TWITTER_FRIENDS, access_token, {'page': page})
    json = fetch_response(oauth_request)
    return json

def update_status(consumer, access_token, status):
    """Update twitter status, i.e., post a tweet"""
    oauth_request = request_oauth_resource(consumer,
                                           TWITTER_UPDATE_STATUS,
                                           access_token,
                                           {'status': status},
                                           http_method='POST')
    json = fetch_response(oauth_request)
    return json

