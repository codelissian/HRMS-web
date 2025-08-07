import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';

const CustomCard = ({
  title,
  subtitle,
  children,
  actions,
  headerAction,
  elevation = 1,
  sx = {},
  headerProps = {},
  contentProps = {},
  actionsProps = {},
}) => {
  return (
    <Card elevation={elevation} sx={{ height: '100%', ...sx }}>
      {(title || subtitle || headerAction) && (
        <CardHeader
          title={
            title && (
              <Typography variant="h6" component="div">
                {title}
              </Typography>
            )
          }
          subheader={
            subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )
          }
          action={headerAction}
          {...headerProps}
        />
      )}
      
      <CardContent {...contentProps}>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions {...actionsProps}>
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

// Stat Card component for dashboard metrics
export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  sx = {},
}) => {
  return (
    <CustomCard
      sx={{
        background: `linear-gradient(135deg, ${color}.light 0%, ${color}.main 100%)`,
        color: 'white',
        ...sx,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Chip
                label={trend}
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                }}
              />
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </CustomCard>
  );
};

export default CustomCard; 