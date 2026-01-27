from rest_framework.renderers import JSONRenderer

class StandardResponseRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response_data = {'status': True, 'message': 'Success', 'data': data}
        
        response = renderer_context.get('response')
        if response is not None:
             # Check if status code is error (4xx or 5xx)
            if response.status_code >= 400:
                response_data['status'] = False
                response_data['message'] = 'Error'
                response_data['errors'] = data
                # If wrapped data is already present, unwrapping could be complex, 
                # but usually DRF returns dict of errors here.
                if 'data' in response_data:
                    del response_data['data']

        return super().render(response_data, accepted_media_type, renderer_context)
