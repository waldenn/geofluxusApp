# Generated by Django 2.2.8 on 2020-01-27 12:38

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0010_remove_actor_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='actor',
            name='geom',
            field=django.contrib.gis.db.models.fields.PointField(blank=True, null=True, srid=4326, verbose_name='longitude/latitude'),
        ),
    ]
