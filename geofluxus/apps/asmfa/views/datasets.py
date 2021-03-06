from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (DatasetType,
                                         Dataset)
from geofluxus.apps.login.models import (GroupDataset)
from geofluxus.apps.asmfa.serializers import (DatasetTypeSerializer,
                                              DatasetSerializer)
from geofluxus.apps.asmfa.serializers import (DatasetTypeListSerializer,
                                              DatasetListSerializer)
from geofluxus.apps.asmfa.serializers import (DatasetTypeCreateSerializer,
                                              DatasetCreateSerializer)
from rest_framework.response import Response
from collections import OrderedDict


# DatasetType
class DatasetTypeViewSet(PostGetViewMixin,
                         ViewSetMixin,
                         ModelPermissionViewSet):
    queryset = DatasetType.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = DatasetTypeSerializer
    serializers = {
        'list': DatasetTypeListSerializer,
        'create': DatasetTypeCreateSerializer
    }


# Dataset
class DatasetViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Dataset.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = DatasetSerializer
    serializers = {
        'list': DatasetListSerializer,
        'create': DatasetCreateSerializer
    }

    def list(self, request, **kwargs):
        from django.http import HttpResponse
        if request.query_params.get('request', None) == 'template':
            serializer = self.serializers.get('create', None)
            if serializer and hasattr(serializer, 'create_template'):
                content = serializer.create_template()
                response = HttpResponse(
                    content_type=(
                        'application/vnd.openxmlformats-officedocument.'
                        'spreadsheetml.sheet'
                    )
                )
                model = self.serializer_class.Meta.model
                filename = model._meta.object_name.lower()
                response['Content-Disposition'] = \
                    'attachment; filename={}.xlsx'.format(filename)
                response.write(content)
                return response

        # retrieve datasets for user
        user = request.user
        groups = user.groups.values_list('id', flat=True)
        ids = GroupDataset.objects.filter(group__id__in=groups) \
                                  .values_list('dataset__id', flat=True) \
                                  .distinct()

        # filter and serialize
        if not user.is_superuser:
            self.queryset = self.queryset.filter(id__in=ids)
        serializer = DatasetSerializer(self.queryset,
                                       many=True,
                                       context={'request': request})
        return Response(OrderedDict([
            ('count', self.queryset.count()),
            ('results', serializer.data)
        ]))