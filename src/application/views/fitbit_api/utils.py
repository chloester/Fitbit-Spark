import logging
import application
import application.secret_keys
import os
import urllib

from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.api import app_identity

import oauth

signature_method = oauth.OAuthSignatureMethod_HMAC_SHA1()
#signature_method = oauth.OAuthSignatureMethod_PLAINTEXT()

SERVER = 'www.fitbit.com'
OTHER_SERVER = 'api.fitbit.com'
REQUEST_TOKEN_URL = 'https://%s/oauth/request_token' % OTHER_SERVER
ACCESS_TOKEN_URL = 'https://%s/oauth/access_token' % OTHER_SERVER
AUTHORIZATION_URL = 'https://%s/oauth/authorize' % SERVER
if os.environ['SERVER_SOFTWARE'].startswith('Development'):
    CALLBACK_URL = 'http://localhost:8008/fitbit/return'
else:
    CALLBACK_URL = 'http://%s/fitbit/return'%(
        app_identity.get_default_version_hostname())

CONSUMER_KEY = application.secret_keys.CONSUMER_KEY
CONSUMER_SECRET = application.secret_keys.CONSUMER_SECRET

# We use this URL to check if Fitbit's oAuth worked
BASE = 'https://api.fitbit.com'
GET_USER_INFO = '%s/1/user/-/profile.json' %BASE
GET_INTRADAY_STEPS = '%s/1/user/-/activities/log/steps/date/2011-11-09/1d.json' %BASE

def request_oauth_resource(consumer, url, access_token, parameters=None, signature_method=signature_method, http_method="GET"):
    """
    usage: request_oauth_resource( consumer, '/url/', your_access_token, parameters=dict() )
    Returns a OAuthRequest object
    """
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=access_token, http_method=http_method, http_url=url, parameters=parameters
        )
    oauth_request.sign_request(signature_method, consumer, access_token)
    #logging.debug('oauth_request: %s'%oauth_request.to_url())
    return oauth_request


def fetch_response(oauth_request):
    headers = oauth_request.to_header()
    if oauth_request.http_method == 'GET':
        url = oauth_request.get_normalized_http_url()
    else:
        url = oauth_request.get_normalized_http_url()
    logging.info("Fetching %s with %s; headers %s"%(url, oauth_request.http_method, headers))
    return urlfetch.fetch(url, method=oauth_request.http_method, headers=headers).content

def get_unauthorised_request_token(consumer, signature_method=signature_method):
    parameters = {'oauth_callback': CALLBACK_URL}
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, http_url=REQUEST_TOKEN_URL, parameters=parameters,
        http_method="POST")
    oauth_request.sign_request(signature_method, consumer, None)
    resp = fetch_response(oauth_request)
    token = oauth.OAuthToken.from_string(resp)
    return token

def get_authorisation_url(consumer, token, signature_method=signature_method):
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=token, http_url=AUTHORIZATION_URL)
    oauth_request.sign_request(signature_method, consumer, token)
    return oauth_request.to_url()

def exchange_request_token_for_access_token(consumer, request_token, signature_method=signature_method,
                                            parameters={}):
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token=request_token, http_url=ACCESS_TOKEN_URL,
        http_method="POST", parameters=parameters)
    oauth_request.sign_request(signature_method, consumer, request_token)
    resp = fetch_response(oauth_request)
    token = oauth.OAuthToken.from_string(resp)
    if not token.key and not token.secret:
        logging.error("Got no token for %s"%(oauth_request.get_normalized_http_url()))
    return token

	

