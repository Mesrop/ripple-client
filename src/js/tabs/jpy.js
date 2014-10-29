var util = require('util'),
    Tab = require('../client/tab').Tab;

var JpyTab = function ()
{
  Tab.call(this);
};

util.inherits(JpyTab, Tab);

JpyTab.prototype.tabName = 'jpy';
JpyTab.prototype.mainMenu = 'fund';

JpyTab.prototype.angularDeps = Tab.prototype.angularDeps.concat(['qr']);

JpyTab.prototype.generateHtml = function ()
{
  return require('../../jade/tabs/jpy.jade')();
};

JpyTab.prototype.angular = function (module)
{
 

};

module.exports = JpyTab;
