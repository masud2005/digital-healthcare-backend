# Jenkins Job Setup

If the Jenkins build log only says this:

```text
Started by GitLab push by Sabbir Hossain Shuvo
Running as SYSTEM
Building in workspace /var/jenkins_home/workspace/doc-backend
Finished: SUCCESS
```

then Jenkins received the GitLab webhook, but it did not run this repository's `Jenkinsfile`.

A real run should show stages like:

```text
[Pipeline] stage
[Pipeline] { (Checkout)
[Pipeline] { (Install)
[Pipeline] { (Quality Gate)
[Pipeline] { (Build Image)
```

## Fix

Create or reconfigure the Jenkins job as a Pipeline job.

1. Open Jenkins.
2. Open the `doc-backend` job.
3. Click **Configure**.
4. In **Definition**, choose **Pipeline script from SCM**.
5. In **SCM**, choose **Git**.
6. Set **Repository URL** to this GitLab repository URL.
7. Set credentials if the repository is private.
8. Set **Branch Specifier** to the branch you deploy from, for example:

```text
*/main
```

or:

```text
*/dev
```

9. Set **Script Path** to:

```text
Jenkinsfile
```

10. Enable your GitLab webhook trigger.
11. Save.
12. Click **Build Now** once manually.

## Required Jenkins Plugins

- Pipeline
- Git
- GitLab
- SSH Agent
- Credentials Binding

The Jenkins agent also needs:

- Node.js and npm
- Docker CLI
- Docker permission for the Jenkins user

## Single-Server Jenkins

If Jenkins runs on the same VPS as the app and is bound to host loopback like this:

```text
127.0.0.1:8080->8080/tcp
```

keep Jenkins private and expose it through Caddy:

```caddyfile
jenkins.weightlossmdcherrycreek.com {
    reverse_proxy host.docker.internal:8080
}
```

Because release Caddy runs inside Docker, `127.0.0.1:8080` would point to the Caddy container itself. The release compose file maps `host.docker.internal` to the Docker host gateway so Caddy can reach Jenkins on the host loopback port.

For this single-server pipeline, Jenkins still deploys over SSH to the VPS host. This is intentional because Jenkins runs in a container; using SSH makes Docker commands run against the host Docker engine, so containers appear in the host `docker ps`.

Create a Jenkins credential named `doc-vps-ssh` using **SSH Username with private key**. The username should be `root` for the current Jenkinsfile.

## Required Credentials

These IDs must exist in Jenkins because the `Jenkinsfile` references them:

- `dockerhub-creds`

The server should keep these env files in the deployment directory:

```text
/var/projects/doc-backend/.env.production
/var/projects/doc-backend/.env.prerelease
```

Use this in `.env.production`:

```env
DATABASE_URL=postgresql://doc:<password>@db_live:5432/doc
```

Use this in `.env.prerelease`:

```env
DATABASE_URL=postgresql://doc:<password>@db_pre:5432/doc
```

Production must use `db_live`; prerelease must use `db_pre`.

## Important

Do not configure this as a Freestyle job with only a GitLab trigger. A Freestyle job can be triggered successfully and still do nothing useful. The pipeline must load `Jenkinsfile` from SCM.
