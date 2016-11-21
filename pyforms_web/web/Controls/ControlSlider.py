from pyforms_web.web.Controls.ControlBase import ControlBase


class ControlSlider(ControlBase):

	_min = 0
	_max = 100

	def __init__(self, label = "", defaultValue = 0, min = 0, max = 100):
		self._updateSlider = True
		self._min = min
		self._max = max
		self._value = 0
		
		ControlBase.__init__(self, label, defaultValue)
		
	def init_form(self): return "new ControlSlider('{0}', {1})".format( self._name, str(self.serialize()) )



	def changed(self): pass
	

	@property
	def min(self): return self._min

	@min.setter
	def min(self, value):
		if self._min!=value: self._update_client = True
		self._min = value

	@property
	def max(self):  return  self._max

	@max.setter
	def max(self, value):
		if self._max!=value: self._update_client = True
		self._max = value

	@property
	def value(self): return int(self._value)

	@value.setter
	def value(self, value):
		oldvalue = self._value
		self._value = int(value)
		if oldvalue!=value: 
			self._update_client = True
			self.changed_event()


	def serialize(self):
		data = ControlBase.serialize(self)
		data.update({ 'max': self.max, 'min': self.min })
		return data
		
	def deserialize(self, properties):
		ControlBase.deserialize(self,properties)
		self.max = properties[u'max']
		self.min = properties[u'min']
		