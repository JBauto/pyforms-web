from pyforms_web.web.Controls.ControlBase import ControlBase

class ControlTextArea(ControlBase):

	def init_form(self):
		return """new ControlTextArea('{0}', {1})""".format(
			self._name, 
			str(self.serialize()) 
		)

	@property
	def value(self): return str(ControlBase.value.fget(self))

	@value.setter
	def value(self, value): ControlBase.value.fset(self, value)