# Generated by Django 2.2.8 on 2020-05-18 16:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0014_flow_vehicle'),
    ]

    operations = [
        migrations.AddField(
            model_name='routing',
            name='distance',
            field=models.FloatField(default=0),
        ),
    ]