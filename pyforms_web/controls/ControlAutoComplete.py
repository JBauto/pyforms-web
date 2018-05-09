from pyforms_web.controls.ControlBase import ControlBase
import simplejson, collections

class ValueNotSet: pass


class ControlAutoComplete(ControlBase):

    def __init__(self, *args, **kwargs):
        self._init_form_called = False
        super(ControlAutoComplete, self).__init__(*args, **kwargs)
        
        # configure the Combo to get its items from an URL
        self.items_url = kwargs.get('items_url', None)
        # set the function to query the items in the case we are using the url mode
        self.items_query = kwargs.get('items_query', self.items_query)
        # set the model to wich the autocomplete will get the values
        self.model = kwargs.get('model', None)

        # allow multiple choices
        self.multiple = kwargs.get('multiple', False)

    def init_form(self): 
        self._init_form_called = True
        return "new ControlAutoComplete('{0}', {1})".format( self._name, simplejson.dumps(self.serialize()) )

    def items_query(self, keyword):
        return []

    @property
    def value(self):  return self._value

    @value.setter
    def value(self, value):
        if self._value!=value: self.mark_to_update_client()
        self._value = value
    
    def deserialize(self, data):
        super(ControlAutoComplete,self).deserialize(data)

        if self.multiple:
            self.value = data.get('value').split(',')

    def serialize(self):
        data = super(ControlAutoComplete,self).serialize()

        if self.model:
            value = self._value if isinstance(self._value, list) else [self._value]
            value = [v for v in value if v]

            if value:
                query = self.model.objects.filter(pk__in=value)
                items = [{'name':str(o), 'value':o.pk, 'text':str(o)} for o in query]
            else:
                items = []

        data.update({'items_url': self.items_url, 'items':items, 'multiple':self.multiple})

        return data
        
