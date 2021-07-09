USERNAME, PASSWORD = 'promosdirceux6', 'xxx123xxx'
PHONE_NUMBER = '86 99569-8523'
PROXY = 'daenerys_insta:alphaxxxpass123@alpha.mobileproxy.network:10014'

LOGIN_URL = 'https://i.instagram.com/api/v1/accounts/login/'
CHECKEMAIL_URL = 'https://i.instagram.com/api/v1/users/check_email/'
CHECKPHONE_URL = 'https://i.instagram.com/api/v1/accounts/check_phone_number/'
VERIFYEMAIL_URL = 'https://i.instagram.com/api/v1/accounts/send_verify_email/'
CHECKCODE_URL = 'https://i.instagram.com/api/v1/accounts/check_confirmation_code/'

REQUEST_HEADERS = { 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8' }
IG_SIG_KEY = '99e16edcca71d7c1f3fd74d447f6281bd5253a623000a55ed0b60014467a53b1'

# I have more devices here:
# https://github.com/instagrambot/instabot/blob/72d10447986db39ac95f3d0980936d9c08428b02/instabot/api/devices.py
# idk which to use, let's for now use this one, because it is just works

DEVICE = {
    'instagram_version': '26.0.0.10.86',
    'android_version': 24,
    'android_release': '7.0',
    'dpi': '640dpi',
    'resolution': '1440x2560',
    'manufacturer': 'HUAWEI',
    'device': 'LON-L29',
    'model': 'HWLON',
    'cpu': 'hi3660'
}

USER_AGENT_BASE = (
    'Instagram {instagram_version} '
    'Android ({android_version}/{android_release}; '
    '{dpi}; {resolution}; {manufacturer}; '
    '{device}; {model}; {cpu}; en_US)'
)

user_agent = USER_AGENT_BASE.format(**DEVICE)  # just insert params

import uuid as uuid_library
import hmac
import json
import hashlib
import requests
import six.moves.urllib as urllib

proxies = {
  'http': 'http://'+PROXY,
  'https': 'http://'+PROXY,
}

def hex_digest(*args):
    m = hashlib.md5()
    m.update(b''.join([arg.encode('utf-8') for arg in args]))
    return m.hexdigest()

def generate_device_id(seed):
    volatile_seed = "12345"  # Important ! :) :)
    m = hashlib.md5()
    m.update(seed.encode('utf-8') + volatile_seed.encode('utf-8'))
    return 'android-' + m.hexdigest()[:16]

def generate_uuid():
    return str(uuid_library.uuid4())

def generate_signature(data):
    body = hmac.new(IG_SIG_KEY.encode('utf-8'), data.encode('utf-8'),
                    hashlib.sha256).hexdigest() + '.' + urllib.parse.quote(data)
    signature = 'ig_sig_key_version=4&signed_body={body}'
    return signature.format(body=body)

def generate_signature_v2(data):
    body      = 'SIGNATURE.' + urllib.parse.quote(data)
    signature = 'signed_body={body}'
    return signature.format(body=body)

phone_id = generate_uuid()
uuid = generate_uuid()
device_id = generate_device_id(hex_digest(USERNAME, USERNAME))

data = json.dumps({
    'phone_id': phone_id,
    'device_id': device_id,
    'guid': uuid,
    'username': 'promosdirceu2',
    'password': PASSWORD,
})
checkemail_data = json.dumps({
    'phone_id': phone_id,
    'device_id': device_id,
    'guid': uuid,
    'email': USERNAME+'@debsmail.com'
})
checkphone_data = json.dumps({
    'phone_id': phone_id,
    'device_id': device_id,
    'guid': uuid,
    'phone_number': PHONE_NUMBER
})
checkphone_data = generate_signature_v2(checkphone_data)

session = requests.Session()
session.headers.update(REQUEST_HEADERS)
session.headers.update({'User-Agent': user_agent})

# response = session.post(CHECKEMAIL_URL, data=checkemail_data, proxies=proxies)
response = session.post(CHECKPHONE_URL, data=checkphone_data, proxies=proxies)
resp = json.loads(response.content)

print 'XXX 1'
print response.status_code
print response.content
print response.headers
print 'XXX 1'

response = session.post(VERIFYEMAIL_URL, data=checkemail_data, proxies=proxies)
resp = json.loads(response.content)

print 'XXX 2'
print response.status_code
print response.content
print response.headers
print 'XXX 2'

code = input('Code: ')

checkconfirmation_data = json.dumps({
    'phone_id': phone_id,
    'device_id': device_id,
    'guid': uuid,
    'email': USERNAME+'@debsmail.com',
    'code': code
})

checkconfirmation_data = generate_signature(checkconfirmation_data)

response = session.post(CHECKCODE_URL, data=checkconfirmation_data, proxies=proxies)
resp = json.loads(response.content)

print 'XXX 3'
print response.status_code
print response.content
print response.headers
print 'XXX 3'