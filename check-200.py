import sys
import requests

headers_discord = {
    "Accept": "application/json"
}

suffixes = {
    "prod": "",
    "rc": "-rc"
}


def get_urls(env):
    suffix = suffixes.get(env)
    return {
        "web": f"https://www{suffix}.site.com/fr/objets-bim",
        "web-api": f"https://www{suffix}.site.com/api",
        "bo": f"https://bo{suffix}.site.com/",
        "bo-api": f"https://bo{suffix}.site.com/api",
        "analytics": f"https://analytics{suffix}.site.com/",
        "analytics-api": f"https://analytics{suffix}.site.com/api",
        "auth": f"https://auth{suffix}.site.com/",
        "auth-api": f"https://auth{suffix}.site.com/api/.well-known/openid-configuration",
    }


def get_testing_urls(env):
    return {
        "web": f"https://{env}.site.com/fr/objets-bim",
        "web-api": f"https://{env}.site.com/api",
        "bo": f"https://{env}bo.site.com/",
        "bo-api": f"https://{env}bo.site.com/api",
        "analytics": f"https://{env}analytics.site.com/",
        "analytics-api": f"https://{env}analytics.site.com/api",
        "auth": f"https://{env}auth.site.com/",
        "auth-api": f"https://{env}auth.site.com/api/.well-known/openid-configuration",
    }


def check_all(env):
    if env in suffixes.keys():
        urls = get_urls(env)
    elif env in ["preprod", "test"]:
        urls = get_testing_urls(env)
    else:
        error_discord("Misusage - accepted envs are : prod, rc, preprod, test")
        return

    results = []

    for site, url in urls.items():
        try:
            res = requests.get(url, allow_redirects=False, timeout=60)
            status = res.status_code
        except:
            pass
        finally:
            if status is None:
                value = f" :x: UNKNOWN"
            elif status == 200 or status == 302:
                value = f":white_check_mark: {status}"
            else:
                value = f":x: **{status}**"
                
            results.append({
                "name": site,
                "url": url,
                "value": value,
                "inline": True
            })
            

    send_discord({
        "embeds": [
            {
                "title": f"{env.upper()} - status checks results",
                "color": 15258703,
                "fields": results
            }
        ]
    })


def error_discord(message):
    send_discord(f"An error occured. In chicoumbetov/cicd > workflow deploy-checks > check-200.py. Details : {message}")


def send_discord(message):
    requests.post("https://discord.com/api/webhooks/ ...."
                  "...",
                  headers=headers_discord, json=message)


if len(sys.argv) == 2:
    check_all(sys.argv[1])

