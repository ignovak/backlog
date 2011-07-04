#!/usr/bin/env python
#-*- coding: utf-8 -*-
#### 
import os 
import sys 
import logging 
from appengine_django import InstallAppengineHelperForDjango 
InstallAppengineHelperForDjango(version='1.1') 
from google.appengine.ext.admin import main as admin_main 
def main(): 
    admin_main() 
if __name__ == '__main__': 
    main() 

