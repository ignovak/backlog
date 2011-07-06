#!/usr/bin/env python
#-*- coding: utf-8 -*-

from google.appengine.ext import webapp, db
from google.appengine.ext.webapp import util, template

import os
import logging
import simplejson

import view

class BacklogItem(db.Model):
  TYPES = ['AIR', 'Website', 'Hub']
  name = db.StringProperty()
  type = db.StringProperty(choices = set(TYPES))
  desc = db.TextProperty()
  priority = db.IntegerProperty()
  opened = db.BooleanProperty(default=True)

class MainHandler(webapp.RequestHandler):
  def get(self, action):
    action = 'edit' if action == 'new' else 'index'

    path = os.path.join('templates/%s.html' % action)
    items = BacklogItem.all().filter('opened =', True).order('-priority')
    params = {
      'action': '/',
      'types': BacklogItem.TYPES,
      'items': items,
      'itemType': self.request.get('type')
    }
    self.response.out.write(template.render(path, params))
    return
    if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
      resp = dict(map(lambda x: (x.key().id(), {
        'type': x.type,
        'name': x.name,
        'desc': x.desc,
        'priority': x.priority,
        'opened': x.opened
      }), items))
      self.response.headers['Content-Type'] = 'text/plain'
      self.response.out.write(simplejson.dumps(resp))

  def post(self, action):
    BacklogItem(
        name = self.request.get('name'),
        type = self.request.get('type'),
        desc = self.request.get('desc'),
        priority = int(self.request.get('priority'))
    ).put()

    if not self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
      self.redirect('/')

class ItemHandler(webapp.RequestHandler):
  def get(self, id, action):
    if action == 'close':
      item = BacklogItem.get_by_id(int(id))
      item.opened = False
      item.put()
      self.__redirect('/')
      return

    action = 'edit' if action == 'edit' else 'show'
    path = os.path.join('templates/%s.html' % action)
    item = BacklogItem.get_by_id(int(id))

    params = {
      'action': '/%s/edit' % id,
      'types': BacklogItem.TYPES,
      'item': item,
      'itemType': item.type
    }
    self.response.out.write(template.render(path, params))

  def post(self, id, action):
    item = BacklogItem.get_by_id(int(id))
    item.name = self.request.get('name')
    item.type = self.request.get('type')
    item.desc = self.request.get('desc')
    item.priority = int(self.request.get('priority'))
    item.put()
    self.__redirect('/')

  def __redirect(self, path):
    if not self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
      self.redirect(path)

def main():
  application = webapp.WSGIApplication([
    ('/(\d+)(?:/(.*))?', ItemHandler),
    ('/(\w+)?', MainHandler)
    ], debug=True)
  util.run_wsgi_app(application)

if __name__ == '__main__':
  main()
