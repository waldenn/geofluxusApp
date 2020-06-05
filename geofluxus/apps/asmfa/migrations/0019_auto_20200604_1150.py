# Generated by Django 3.0.6 on 2020-06-04 11:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0018_auto_20200604_1041'),
    ]

    operations = [
        migrations.CreateModel(
            name='Dataset',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('citekey', models.CharField(max_length=255)),
                ('author', models.CharField(max_length=255)),
                ('title', models.CharField(max_length=255)),
                ('note', models.TextField()),
                ('url', models.URLField(blank=True, null=True)),
                ('file_url', models.URLField(blank=True, null=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='publication',
            name='publicationtype',
        ),
        migrations.RemoveField(
            model_name='actor',
            name='publication',
        ),
        migrations.RemoveField(
            model_name='area',
            name='publication',
        ),
        migrations.RemoveField(
            model_name='flowchain',
            name='publication',
        ),
        migrations.RenameModel(
            old_name='PublicationType',
            new_name='DatasetType',
        ),
    ]