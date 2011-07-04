#!/usr/bin/env python
#-*- coding: utf-8 -*-

from google.appengine.ext import webapp, db
from google.appengine.ext.webapp import util
from main import BacklogItem

class Test(webapp.RequestHandler):
  def get(self):
    self.response.out.write('lol')

class OpenItems(webapp.RequestHandler):
  def get(self):
    return
    for item in BacklogItem.all():
      # item.opened = True
      item.priority *= 10
      item.put()

def main():
  application = webapp.WSGIApplication([
    ('/admin/openItems', OpenItems),
    ('/admin/test', Test)
    ], debug=True)
  util.run_wsgi_app(application)

if __name__ == '__main__':
  main()
