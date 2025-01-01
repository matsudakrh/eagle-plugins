// TODO: 網羅しきれていない
type Rule = {
  $$hashKey: string
  property: 'folders'
  value: string[]
  method:
    'union'
    | 'intersection'
} | {
  $$hashKey: string
  property: 'tags'
  value: string[]
  method:
    'union'
    | 'intersection'
} | {
  $$hashKey: string
  property: 'name'
  value: string
  method:
    'startWith'
    | 'endWith'
    | 'equal'
    | 'empty'
    | 'not-empty'
    | 'regex'
    | 'contain'
    | 'uncontain'
} |  {
  $$hashKey: string
  property: 'type'
  value: string
  method:
    'equal'
    | 'unequal'
} | {
  $$hashKey: string
  property: 'color'
  method:
    'similar'
    | 'accuracy'
    | 'grayscale'
  value: string
}

export default Rule