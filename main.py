#!/usr/bin/env python
#-*- coding: utf-8 -*-

from google.appengine.api import channel
from google.appengine.ext import webapp, db
from google.appengine.ext.webapp import util, template

import os
import logging
import simplejson

class BacklogItem(db.Model):
  TYPES = ['AIR', 'Website', 'Hub', 'Backlog']
  STATUSES = ['new', 'assigned', 'processed', 'completed', 'closed']
  name = db.StringProperty()
  type = db.StringProperty(choices = set(TYPES))
  desc = db.TextProperty()
  priority = db.IntegerProperty()
  status = db.StringProperty(choices = set(STATUSES))

class OpenedPage(webapp.RequestHandler):
  def post(self):
    channel.send_message('testtest', {
        "test": "test"
      })

class MainHandler(webapp.RequestHandler):
  def get(self, action):
    if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
      self.response.headers['Content-Type'] = 'text/plain'

      items = BacklogItem.all()#.filter('status !=', 'closed')#.order('-priority')

      if action == 'getOrder':
        resp = map(lambda x: str(x.key().id()) + '=' + str(x.priority), items)
      else:
        resp = map(lambda x: {
          'id': x.key().id(),
          'type': x.type,
          'name': x.name,
          'desc': x.desc,
          'priority': x.priority,
          'status': x.status
        }, items)
      self.response.out.write(simplejson.dumps({'data': resp}))
      return

    action = 'edit' if action == 'new' else 'index'

    path = os.path.join('templates/%s.html' % action)
    params = {
      'types': BacklogItem.TYPES,
      'statuses': BacklogItem.STATUSES,
      'token': channel.create_channel('testtest')
    }
    self.response.out.write(template.render(path, params))

  def post(self, action):
    BacklogItem(
      name = self.request.get('name'),
      type = self.request.get('type'),
      desc = self.request.get('desc'),
      status = self.request.get('status'),
      priority = int(self.request.get('priority'))
    ).put()

    if not self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
      self.redirect('/')

class ItemHandler(webapp.RequestHandler):
  def get(self, id, action):
    if action == 'close':
      item = BacklogItem.get_by_id(int(id))
      item.status = 'closed'
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
    if action == 'update_priority':
      item.priority = int(self.request.get('priority'))
    elif action == 'update_status':
      item.status = self.request.get('status')
    else:
      item.name = self.request.get('name')
      item.type = self.request.get('type')
      item.desc = self.request.get('desc')
      item.priority = int(self.request.get('priority'))
      item.status = self.request.get('status')
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
