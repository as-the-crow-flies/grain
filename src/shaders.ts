export const QUAD = `
const vec2 quad[6] = vec2[6](
vec2(-1, -1), vec2(1, 1), vec2(-1, 1),
vec2(-1, -1), vec2(1,-1), vec2( 1, 1)
);

void main()
{
  gl_Position = vec4(quad[gl_VertexID], 0, 1);
}
`