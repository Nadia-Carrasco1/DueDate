from django import template

register = template.Library()

@register.filter
def lowfirst(string):
    if not string:
        return ""
    return string[0].lower() + string[1:]