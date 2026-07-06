run these before starting 

```
docker exec -it ai-tutor-postgres psql -U postgres -c "CREATE DATABASE ai_tutor;"
```

```
docker run -d --name ai-tutor-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -v  postgres:17
```