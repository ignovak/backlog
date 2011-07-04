#!/usr/bin/env python
#-*- coding: utf-8 -*-

from google.appengine.ext import webapp, db
from google.appengine.ext.webapp import util, template

import os
import logging

class BacklogItem(db.Model):
  TYPES = ('AIR', 'Hub', 'Website')
  name = db.StringProperty()
  type = db.StringProperty(choices = TYPES)
  desc = db.TextProperty()
  priority = db.IntegerProperty()
  opened = db.BooleanProperty(default=True)

class MainHandler(webapp.RequestHandler):
  def get(self, action):
    action = 'edit' if action == 'new' else 'index'

    path = os.path.join('templates/%s.html' % action)
    itemsDict = dict(map(lambda t: (t, BacklogItem.all().filter('opened =', True).filter('type =', t).order('-priority')), BacklogItem.TYPES))
    params = {
      'action': '/',
      'types': BacklogItem.TYPES,
      'itemsDict': itemsDict
    }
    self.response.out.write(template.render(path, params))

  def post(self, action):
    BacklogItem(
        name = self.request.get('name'),
        type = self.request.get('type'),
        desc = self.request.get('desc'),
        priority = int(self.request.get('priority'))
    ).put()
    self.redirect('/')

class ItemHandler(webapp.RequestHandler):
  def get(self, id, action):
    if action == 'close':
      item = BacklogItem.get_by_id(int(id))
      item.opened = False
      item.put()
      self.redirect('/')
      return

    action = 'edit' if action == 'edit' else 'show'
    path = os.path.join('templates/%s.html' % action)
    item = BacklogItem.get_by_id(int(id))

    params = {
      'action': '/%s/edit' % id,
      'types': BacklogItem.TYPES,
      'item': item
    }
    self.response.out.write(template.render(path, params))

  def post(self, id, action):
    item = BacklogItem.get_by_id(int(id))
    item.name = self.request.get('name')
    item.type = self.request.get('type')
    item.desc = self.request.get('desc')
    item.priority = int(self.request.get('priority'))
    item.put()
    self.redirect('/')

def main():
  application = webapp.WSGIApplication([
    ('/(\d+)(?:/(.*))?', ItemHandler),
    ('/(\w+)?', MainHandler)
    ], debug=True)
  util.run_wsgi_app(application)

if __name__ == '__main__':
  main()
