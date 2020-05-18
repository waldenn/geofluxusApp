# Generated by Django 2.2.8 on 2020-05-17 08:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0013_flow_routing'),
    ]

    operations = [
        migrations.AddField(
            model_name='flow',
            name='vehicle',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='asmfa.Vehicle'),
        ),
    ]
