# Voter Rideshare

Connecting voters with volunteer drivers to ensure everyone can exercise their right to vote.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Run development server
pnpm dev
```

## Development

```bash
# Run tests
pnpm test

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## Deployment

The application is automatically deployed to Heroku when changes are pushed to the main branch.

### Manual Deployment

```bash
# Login to Heroku
heroku login

# Push to Heroku
git push heroku main

# Run database migrations
heroku run pnpm db:migrate
```

### Environment Variables

Required environment variables:

```plaintext
MONGODB_URI=
REDIS_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_MAPS_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=
```

See `.env.example` for all available options.

### Monitoring

The application's health can be checked at:
- `/api/health` - System health check
- `/metrics` - Application metrics (protected)

### Security

- All API routes are rate-limited
- SSL/TLS required in production
- CORS configured for known domains
- Security headers enabled
- CSP policies in place

### Backup

Automated backups run daily and are stored in S3:
```bash
# Manual backup
heroku run node scripts/backup.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Contact

Michael Vacirca - michael@michaelvacirca.com

Project Link: [https://github.com/MichaelVacirca/voter-rideshare](https://github.com/MichaelVacirca/voter-rideshare)